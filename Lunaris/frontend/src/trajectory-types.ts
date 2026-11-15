import type { CelestialMarkerLocation } from './celestial-marker-types'

export type TrajectoryPoint = [number, number, number]

export type TrajectorySegment =
  | {
      type: 'curve'
      points: TrajectoryPoint[]
      color?: string
      closed?: boolean
    }
  | {
      type: 'surface-circle'
      id: string
      body: CelestialMarkerLocation['body']
      poleLatitude: number
      poleLongitude: number
      angularRadius: number
      color?: string
    }
  | {
      type: 'parabola'
      fromCircle: string
      toCircle: string
      fromAngle: number
      toAngle: number
      controlPoint: TrajectoryPoint
      color?: string
    }

export type Trajectory = {
  segments: TrajectorySegment[]
}
