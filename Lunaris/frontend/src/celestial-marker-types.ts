export type CelestialMarkerLocation =
  | {
      body: 'earth'
      coordinates: {
        latitude: number
        longitude: number
      }
    }
  | {
      body: 'moon'
      coordinates: {
        selenographicLatitude: number
        selenographicLongitude: number
      }
    }
  | {
      body: 'sun'
      coordinates: {
        heliographicLatitude: number
        heliographicLongitude: number
      }
    }
