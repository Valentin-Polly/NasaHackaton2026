import lunarData from '../../backend/lunar_navigator_frontend_data.json'

const EARTH_MU_KM3_S2 = 398_600.4418
const EARTH_RADIUS_KM = 6_378.137
const EARTH_ROTATION_RAD_S = 7.2921159e-5
const MOON_MU_KM3_S2 = 4_902.8
const MOON_RADIUS_KM = 1_737.4
const LEO_ALTITUDE_KM = 185
const LLO_ALTITUDE_KM = 100
const EARTH_MOON_DISTANCE_KM = 384_400
const MAX_ORBITAL_WAIT_HOURS = 72

type LunarSite = (typeof lunarData.sites)[number] & {
  psr_proximity_km?: number | null
}

export type LandingSiteResult = {
  siteId: string
  name: string
  latitude: number
  longitude: number
  elevationMeters: number
  slopeDegrees: number
  psrProximityKm: number | null
  score: number
  totalDeltaV: number
  deltaV: {
    launch: number
    transLunarInjection: number
    lunarOrbitInsertion: number
    planeChange: number
    poweredDescent: number
    obstacleAvoidance: number
  }
  optimalLandingUtc: string
  hoursWaitingInOrbit: number
  isSunlit: boolean | null
  hasDteComm: boolean | null
  sunlightPercentage: number
  communicationPercentage: number
  usedMonthlyFallback: boolean
}

export type LunarOptimizationResult = {
  estimatedArrivalUtc: string
  optimalSite: LandingSiteResult
  alternatives: LandingSiteResult[]
  ranking: LandingSiteResult[]
  warnings: string[]
}

type SiteTimingResult = {
  landingTime: number
  hoursWaiting: number
  isSunlit: boolean | null
  hasDteComm: boolean | null
  usedMonthlyFallback: boolean
}

const monthNumbers = new Map([
  ['Jan', 0], ['Feb', 1], ['Mar', 2], ['Apr', 3], ['May', 4], ['Jun', 5],
  ['Jul', 6], ['Aug', 7], ['Sep', 8], ['Oct', 9], ['Nov', 10], ['Dec', 11],
])

const easternTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function capeCanaveralLocalTimeToUtc(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null

  const [, yearText, monthText, dayText, hourText, minuteText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const targetWallTime = Date.UTC(year, month - 1, day, hour, minute)
  const normalized = new Date(targetWallTime)

  if (normalized.getUTCFullYear() !== year
    || normalized.getUTCMonth() !== month - 1
    || normalized.getUTCDate() !== day
    || normalized.getUTCHours() !== hour
    || normalized.getUTCMinutes() !== minute) {
    return null
  }

  let utcTime = targetWallTime
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = easternTimeFormatter.formatToParts(new Date(utcTime))
    const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]))
    const renderedWallTime = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
    )
    utcTime += targetWallTime - renderedWallTime
  }

  const resolvedParts = Object.fromEntries(
    easternTimeFormatter
      .formatToParts(new Date(utcTime))
      .map(({ type, value: partValue }) => [type, partValue]),
  )
  if (Number(resolvedParts.year) !== year
    || Number(resolvedParts.month) !== month
    || Number(resolvedParts.day) !== day
    || Number(resolvedParts.hour) !== hour
    || Number(resolvedParts.minute) !== minute) {
    return null
  }

  return new Date(utcTime)
}

function parseEphemerisTimestamp(timestamp: string): number {
  const match = /^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/.exec(timestamp)
  const month = match ? monthNumbers.get(match[2]) : undefined
  if (!match || month === undefined) {
    throw new Error(`Invalid lunar ephemeris timestamp: ${timestamp}`)
  }

  return Date.UTC(
    Number(match[1]),
    month,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  )
}

function calculateFlightTimeSeconds(): number {
  const leoRadius = EARTH_RADIUS_KM + LEO_ALTITUDE_KM
  const transferSemiMajorAxis = (leoRadius + EARTH_MOON_DISTANCE_KM) / 2
  return Math.PI * Math.sqrt(transferSemiMajorAxis ** 3 / EARTH_MU_KM3_S2)
}

function calculateDeltaV(site: LunarSite) {
  const leoRadius = EARTH_RADIUS_KM + LEO_ALTITUDE_KM
  const transferSemiMajorAxis = (leoRadius + EARTH_MOON_DISTANCE_KM) / 2
  const leoVelocity = Math.sqrt(EARTH_MU_KM3_S2 / leoRadius)
  const transferPerigeeVelocity = Math.sqrt(
    EARTH_MU_KM3_S2 * (2 / leoRadius - 1 / transferSemiMajorAxis),
  )
  const transferApogeeVelocity = Math.sqrt(
    EARTH_MU_KM3_S2 * (2 / EARTH_MOON_DISTANCE_KM - 1 / transferSemiMajorAxis),
  )
  const lunarOrbitalVelocity = Math.sqrt(EARTH_MU_KM3_S2 / EARTH_MOON_DISTANCE_KM)
  const lunarParkingRadius = MOON_RADIUS_KM + LLO_ALTITUDE_KM
  const lunarCircularVelocity = Math.sqrt(MOON_MU_KM3_S2 / lunarParkingRadius)
  const lunarArrivalExcessVelocity = Math.abs(lunarOrbitalVelocity - transferApogeeVelocity)
  const lunarPeriluneVelocity = Math.sqrt(
    lunarArrivalExcessVelocity ** 2 + 2 * MOON_MU_KM3_S2 / lunarParkingRadius,
  )
  const rotationalAssist = EARTH_ROTATION_RAD_S
    * EARTH_RADIUS_KM
    * Math.cos((28.6083 * Math.PI) / 180)
  const surfaceRadius = MOON_RADIUS_KM + site.elevation_lola_m / 1_000
  const surfaceLandingVelocity = Math.sqrt(
    Math.max(0, 2 * MOON_MU_KM3_S2 / surfaceRadius - MOON_MU_KM3_S2 / lunarParkingRadius),
  )
  const slopeDegrees = site.slope_lola_deg ?? 1.5
  const deltaV = {
    launch: 9.4 - rotationalAssist,
    transLunarInjection: transferPerigeeVelocity - leoVelocity,
    lunarOrbitInsertion: lunarPeriluneVelocity - lunarCircularVelocity,
    planeChange: 2 * lunarCircularVelocity
      * Math.sin((Math.abs(site.center_lat_deg) * Math.PI) / 360),
    poweredDescent: surfaceLandingVelocity,
    obstacleAvoidance: slopeDegrees * 0.01,
  }

  return {
    deltaV,
    total: Object.values(deltaV).reduce((total, value) => total + value, 0),
    slopeDegrees,
  }
}

function getSiteTiming(site: LunarSite, arrivalTime: number): SiteTimingResult {
  const points = lunarData.ephemeris
    .filter((point) => point.site_id === site.site_id)
    .map((point) => ({ point, time: parseEphemerisTimestamp(point.timestamp_utc) }))
    .sort((left, right) => left.time - right.time)
  const firstTime = points[0]?.time
  const lastTime = points.at(-1)?.time
  const latestSearchTime = arrivalTime + MAX_ORBITAL_WAIT_HOURS * 60 * 60 * 1_000

  if (firstTime === undefined || lastTime === undefined
    || arrivalTime < firstTime || arrivalTime > lastTime) {
    return {
      landingTime: arrivalTime,
      hoursWaiting: 0,
      isSunlit: null,
      hasDteComm: null,
      usedMonthlyFallback: true,
    }
  }

  const validWindow = points.find(({ point, time }) =>
    time >= arrivalTime
      && time <= latestSearchTime
      && point.is_sunlit === 1
      && point.has_dte_comm === 1,
  )

  if (validWindow) {
    return {
      landingTime: validWindow.time,
      hoursWaiting: (validWindow.time - arrivalTime) / (60 * 60 * 1_000),
      isSunlit: true,
      hasDteComm: true,
      usedMonthlyFallback: false,
    }
  }

  const searchWasTruncated = latestSearchTime > lastTime
  if (searchWasTruncated) {
    return {
      landingTime: arrivalTime,
      hoursWaiting: 0,
      isSunlit: null,
      hasDteComm: null,
      usedMonthlyFallback: true,
    }
  }

  const arrivalSample = points.find(({ time }) => time >= arrivalTime)
  return {
    landingTime: arrivalTime,
    hoursWaiting: 0,
    isSunlit: arrivalSample?.point.is_sunlit === 1,
    hasDteComm: arrivalSample?.point.has_dte_comm === 1,
    usedMonthlyFallback: false,
  }
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function getMonthlyPercentage(value: number): number {
  return clampPercentage(value)
}

export function optimizeLunarLanding(departureDate: Date): LunarOptimizationResult {
  const departureTime = departureDate.getTime()
  if (!Number.isFinite(departureTime)) {
    throw new RangeError('Launch date must be a valid date.')
  }

  const arrivalTime = departureTime
    + calculateFlightTimeSeconds() * 1_000
    + 18 * 60 * 60 * 1_000
  const rawResults = lunarData.sites.map((site) => {
    const timing = getSiteTiming(site, arrivalTime)
    const propulsion = calculateDeltaV(site)

    return {
      site,
      timing,
      propulsion,
      sunlightPercentage: getMonthlyPercentage(site.jan2027_sunlight_pct),
      communicationPercentage: getMonthlyPercentage(site.jan2027_dte_comm_pct),
      psrProximityKm: 'psr_proximity_km' in site
        && typeof site.psr_proximity_km === 'number'
        ? site.psr_proximity_km
        : null,
    }
  })
  const deltaVValues = rawResults.map(({ propulsion }) => propulsion.total)
  const minDeltaV = Math.min(...deltaVValues)
  const maxDeltaV = Math.max(...deltaVValues)
  const maxPsrDistance = Math.max(
    0,
    ...rawResults.map(({ psrProximityKm }) => psrProximityKm ?? 0),
  )
  const ranking = rawResults.map((result): LandingSiteResult => {
    const { site, timing, propulsion, sunlightPercentage, communicationPercentage, psrProximityKm } = result
    const topologyScore = clampPercentage(100 - Math.max(0, propulsion.slopeDegrees - 10) * 8)
    const sunlightScore = timing.isSunlit === null
      ? sunlightPercentage
      : timing.isSunlit ? 100 : 0
    const communicationScore = timing.hasDteComm === null
      ? communicationPercentage
      : timing.hasDteComm ? 100 : 0
    const waitingScore = 100 * (1 - Math.min(timing.hoursWaiting, MAX_ORBITAL_WAIT_HOURS) / MAX_ORBITAL_WAIT_HOURS)
    const deltaVScore = maxDeltaV === minDeltaV
      ? 100
      : 100 * (maxDeltaV - propulsion.total) / (maxDeltaV - minDeltaV)
    const psrScore = psrProximityKm === null || maxPsrDistance === 0
      ? 50
      : 100 * (1 - psrProximityKm / maxPsrDistance)
    const score = topologyScore * 0.3
      + sunlightScore * 0.2
      + communicationScore * 0.2
      + waitingScore * 0.1
      + deltaVScore * 0.15
      + psrScore * 0.05

    return {
      siteId: site.site_id,
      name: site.name,
      latitude: site.center_lat_deg,
      longitude: site.center_lon_deg,
      elevationMeters: site.elevation_lola_m,
      slopeDegrees: propulsion.slopeDegrees,
      psrProximityKm,
      score,
      totalDeltaV: propulsion.total,
      deltaV: propulsion.deltaV,
      optimalLandingUtc: new Date(timing.landingTime).toISOString(),
      hoursWaitingInOrbit: timing.hoursWaiting,
      isSunlit: timing.isSunlit,
      hasDteComm: timing.hasDteComm,
      sunlightPercentage,
      communicationPercentage,
      usedMonthlyFallback: timing.usedMonthlyFallback,
    }
  }).sort((left, right) =>
    right.score - left.score
      || left.totalDeltaV - right.totalDeltaV
      || left.name.localeCompare(right.name),
  )

  const warnings: string[] = []
  if (ranking.some((site) => site.usedMonthlyFallback)) {
    warnings.push(
      'La llegada o la ventana de espera queda fuera del rango de efemérides disponible; se usaron los porcentajes mensuales de enero de 2027.',
    )
  }
  if (ranking.every((site) => site.isSunlit !== true || site.hasDteComm !== true)
    && !ranking.some((site) => site.usedMonthlyFallback)) {
    warnings.push('No se encontró una ventana conjunta de luz solar y comunicación directa dentro de las 72 horas.')
  }

  return {
    estimatedArrivalUtc: new Date(arrivalTime).toISOString(),
    optimalSite: ranking[0],
    alternatives: ranking.slice(1, 6),
    ranking,
    warnings,
  }
}
