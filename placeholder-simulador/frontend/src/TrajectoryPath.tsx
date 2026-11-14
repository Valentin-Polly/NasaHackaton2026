import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'
import { Line } from '@react-three/drei'
import type { CelestialMarkerLocation } from './celestial-marker-types'
import type { Trajectory, TrajectorySegment } from './trajectory-types'

type Position = [number, number, number]

type TrajectoryPathProps = {
  trajectory: Trajectory
  surfaces: Record<CelestialMarkerLocation['body'], { center: Position; radius: number }>
}

function getSegmentPoints(
  segment: TrajectorySegment,
  surfaces: TrajectoryPathProps['surfaces'],
) {
  if (segment.type === 'curve') {
    const points = segment.points.map((point) => new Vector3(...point))
    if (points.length < 3) return points

    return new CatmullRomCurve3(points, segment.closed, 'centripetal').getPoints(
      Math.max(points.length * 12, 32),
    )
  }

  const { center, radius } = surfaces[segment.body]
  const latitude = MathUtils.degToRad(segment.poleLatitude)
  const longitude = MathUtils.degToRad(segment.poleLongitude)
  const pole = new Vector3(
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    -Math.cos(latitude) * Math.sin(longitude),
  ).normalize()
  const reference = Math.abs(pole.y) > 0.99
    ? new Vector3(1, 0, 0)
    : new Vector3(0, 1, 0)
  const tangent = new Vector3().crossVectors(reference, pole).normalize()
  const bitangent = new Vector3().crossVectors(pole, tangent).normalize()
  const angularRadius = MathUtils.degToRad(segment.angularRadius)
  const radialComponent = Math.cos(angularRadius)
  const circleRadius = Math.sin(angularRadius)
  const points: Vector3[] = []
  const sampleCount = 180

  for (let index = 0; index <= sampleCount; index += 1) {
    const angle = (index / sampleCount) * Math.PI * 2
    const point = pole.clone().multiplyScalar(radialComponent)
      .addScaledVector(tangent, circleRadius * Math.cos(angle))
      .addScaledVector(bitangent, circleRadius * Math.sin(angle))
      .multiplyScalar(radius + 0.012)
      .add(new Vector3(...center))
    points.push(point)
  }

  return points
}

function TrajectoryPath({ trajectory, surfaces }: TrajectoryPathProps) {
  return (
    <group>
      {trajectory.segments.map((segment, index) => (
        <Line
          key={`${segment.type}-${index}`}
          points={getSegmentPoints(segment, surfaces)}
          color={segment.color ?? '#39ff6b'}
          lineWidth={2}
        />
      ))}
    </group>
  )
}

export default TrajectoryPath
