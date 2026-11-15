import { CatmullRomCurve3, MathUtils, QuadraticBezierCurve3, Vector3 } from 'three'
import { Line } from '@react-three/drei'
import type { CelestialMarkerLocation } from './celestial-marker-types'
import type { Trajectory, TrajectorySegment } from './trajectory-types'

type Position = [number, number, number]

type TrajectoryPathProps = {
  trajectory: Trajectory
  surfaces: Record<CelestialMarkerLocation['body'], { center: Position; radius: number }>
}

type SurfaceCircleSegment = Extract<TrajectorySegment, { type: 'surface-circle' }>

function getSurfaceCirclePoint(
  segment: SurfaceCircleSegment,
  surfaces: TrajectoryPathProps['surfaces'],
  angle: number,
) {
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
  const point = pole.clone().multiplyScalar(Math.cos(angularRadius))
    .addScaledVector(tangent, Math.sin(angularRadius) * Math.cos(angle))
    .addScaledVector(bitangent, Math.sin(angularRadius) * Math.sin(angle))
    .multiplyScalar(radius * 1.008)

  return point.add(new Vector3(...center))
}

function getSegmentPoints(
  segment: TrajectorySegment,
  surfaces: TrajectoryPathProps['surfaces'],
  surfaceCircles: Map<string, SurfaceCircleSegment>,
) {
  if (segment.type === 'curve') {
    const points = segment.points.map((point) => new Vector3(...point))
    if (points.length < 3) return points

    return new CatmullRomCurve3(points, segment.closed, 'centripetal').getPoints(
      Math.max(points.length * 12, 32),
    )
  }

  if (segment.type === 'parabola') {
    const fromCircle = surfaceCircles.get(segment.fromCircle)
    const toCircle = surfaceCircles.get(segment.toCircle)
    if (!fromCircle || !toCircle) {
      throw new Error(
        `Trajectory parabola references an unknown surface circle: ${segment.fromCircle} -> ${segment.toCircle}`,
      )
    }

    return new QuadraticBezierCurve3(
      getSurfaceCirclePoint(fromCircle, surfaces, segment.fromAngle),
      new Vector3(...segment.controlPoint),
      getSurfaceCirclePoint(toCircle, surfaces, segment.toAngle),
    ).getPoints(96)
  }

  const points: Vector3[] = []
  const sampleCount = 180
  for (let index = 0; index <= sampleCount; index += 1) {
    points.push(getSurfaceCirclePoint(segment, surfaces, (index / sampleCount) * Math.PI * 2))
  }
  return points
}

function TrajectoryPath({ trajectory, surfaces }: TrajectoryPathProps) {
  const surfaceCircles = new Map(
    trajectory.segments
      .filter((segment): segment is SurfaceCircleSegment => segment.type === 'surface-circle')
      .map((segment) => [segment.id, segment]),
  )

  return (
    <group>
      {trajectory.segments.map((segment, index) => (
        <Line
          key={`${segment.type}-${index}`}
          points={getSegmentPoints(segment, surfaces, surfaceCircles)}
          color={segment.color ?? '#39ff6b'}
          lineWidth={2}
        />
      ))}
    </group>
  )
}

export default TrajectoryPath
