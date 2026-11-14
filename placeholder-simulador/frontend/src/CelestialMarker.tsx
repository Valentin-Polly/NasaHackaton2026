import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import type { CelestialMarkerLocation } from './celestial-marker-types'
import { CelestialMarkerIcon, EarthMarkerIcon } from './mission-marker-icons'

type Position = [number, number, number]

type CelestialMarkerProps = {
  center: Position
  radius: number
  label: string
  onActivate: () => void
} & CelestialMarkerLocation

function CelestialMarker(props: CelestialMarkerProps) {
  const markerElement = useRef<HTMLButtonElement>(null)
  const cameraPosition = useRef(new Vector3())
  const latitude =
    props.body === 'earth'
      ? props.coordinates.latitude
      : props.body === 'moon'
        ? props.coordinates.selenographicLatitude
        : props.coordinates.heliographicLatitude
  const longitude =
    props.body === 'earth'
      ? props.coordinates.longitude
      : props.body === 'moon'
        ? props.coordinates.selenographicLongitude
        : props.coordinates.heliographicLongitude
  const latitudeRadians = MathUtils.degToRad(latitude)
  const longitudeRadians = MathUtils.degToRad(longitude)
  // Longitudes increase eastward and follow SphereGeometry's equirectangular UV orientation.
  const normal = new Vector3(
    Math.cos(latitudeRadians) * Math.cos(longitudeRadians),
    Math.sin(latitudeRadians),
    -Math.cos(latitudeRadians) * Math.sin(longitudeRadians),
  ).normalize()
  const position = new Vector3(...props.center).addScaledVector(normal, props.radius + 0.035)
  const Icon = props.body === 'earth' ? EarthMarkerIcon : CelestialMarkerIcon

  useFrame(({ camera }) => {
    if (!markerElement.current) return

    camera.getWorldPosition(cameraPosition.current)
    cameraPosition.current.sub(position)
    markerElement.current.style.visibility =
      normal.dot(cameraPosition.current) > 0 ? 'visible' : 'hidden'
  })

  return (
    <Html center position={position} zIndexRange={[2, 0]}>
      <button
        ref={markerElement}
        className="celestial-marker"
        type="button"
        aria-label={props.label}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          props.onActivate()
        }}
      >
        <span className="celestial-marker-face">
          <Icon aria-hidden="true" size={5} strokeWidth={1.5} />
        </span>
      </button>
    </Html>
  )
}

export default CelestialMarker
