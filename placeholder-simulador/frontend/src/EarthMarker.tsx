import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { EarthMarkerIcon } from './mission-marker-icons'

type EarthMarkerProps = {
  latitude: number
  longitude: number
  radius: number
}

function EarthMarker({ latitude, longitude, radius }: EarthMarkerProps) {
  const markerElement = useRef<HTMLDivElement>(null)
  const cameraPosition = useRef(new Vector3())
  const latitudeRadians = MathUtils.degToRad(latitude)
  const longitudeRadians = MathUtils.degToRad(longitude)
  const normal = new Vector3(
    Math.cos(latitudeRadians) * Math.cos(longitudeRadians),
    Math.sin(latitudeRadians),
    -Math.cos(latitudeRadians) * Math.sin(longitudeRadians),
  ).normalize()
  const position = normal.clone().multiplyScalar(radius + 0.035)

  useFrame(({ camera }) => {
    if (!markerElement.current) return

    camera.getWorldPosition(cameraPosition.current)
    cameraPosition.current.sub(position)
    markerElement.current.style.visibility =
      normal.dot(cameraPosition.current) > 0 ? 'visible' : 'hidden'
  })

  return (
    <Html center distanceFactor={10} position={position} zIndexRange={[2, 0]}>
      <div
        ref={markerElement}
        className="earth-marker"
        role="img"
        aria-label="Ubicación en la Tierra"
      >
        <EarthMarkerIcon aria-hidden="true" size={5} strokeWidth={1.5} />
      </div>
    </Html>
  )
}

export default EarthMarker
