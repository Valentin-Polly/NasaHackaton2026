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
      body: CelestialMarkerLocation['body']
      poleLatitude: number
      poleLongitude: number
      angularRadius: number
      color?: string
    }

export type Trajectory = {
  segments: TrajectorySegment[]
}
