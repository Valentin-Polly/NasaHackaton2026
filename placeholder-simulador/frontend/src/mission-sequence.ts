import type { CelestialMarkerLocation } from './celestial-marker-types'
import type { PhotoGalleryData } from './gallery-data'
import type { Trajectory } from './trajectory-types'
import { apollo11FloridaGallery, apollo11MoonGallery } from './gallery-data'

export type MissionStep = {
  id: string
  title: string
  description: string
  trajectory?: Trajectory
  marker?: {
    location: CelestialMarkerLocation
    label: string
    gallery: PhotoGalleryData
  }
}

export type MissionDefinition = {
  id: string
  sequence: string
  protocol: string
  summary: string
  status: string
  sector: string
  steps: [MissionStep, ...MissionStep[]]
}

const lunarMarkerCoordinates = {
  selenographicLatitude: 0.67416,
  selenographicLongitude: 23.47314,
}

export const missionSequence: [MissionDefinition, ...MissionDefinition[]] = [
  {
    id: 'apollo-11',
    sequence: '01',
    protocol: 'MISIÓN / APOLLO 11',
    summary: 'Sigue la misión desde su punto de lanzamiento en Florida hasta una zona de exploración lunar.',
    status: 'EN ESPERA',
    sector: 'TIERRA → LUNA',
    steps: [
      {
        id: 'florida-launch',
        title: 'Punto de lanzamiento',
        description: 'Explora el sitio de lanzamiento de Apollo 11 en Florida.',
        marker: {
          location: {
            body: 'earth',
            coordinates: { latitude: 28.5729, longitude: -80.649 },
          },
          label: 'Abrir galería placeholder de Apollo 11 en Florida',
          gallery: apollo11FloridaGallery,
        },
      },
      {
        id: 'parking-orbit',
        title: 'Órbita de estacionamiento',
        description: 'Recorre la órbita de estacionamiento de Apollo 11 alrededor de la Tierra.',
        trajectory: {
          segments: [
            {
              type: 'surface-circle',
              body: 'earth',
              poleLatitude: 56.6293,
              poleLongitude: -86.4745,
              angularRadius: 89.6776,
            },
            {
              type: 'surface-circle',
              body: 'moon',
              poleLatitude: -81.33,
              poleLongitude: 10.27,
              angularRadius: 86.333,
            },
          ],
        },
      },
      {
        id: 'lunar-exploration',
        title: 'Exploración lunar',
        description: 'Explora Tranquility Base, el lugar exacto donde alunizó Apollo 11.',
        marker: {
          location: {
            body: 'moon',
            coordinates: lunarMarkerCoordinates,
          },
          label: 'Abrir galería de Tranquility Base, sitio de alunizaje de Apollo 11',
          gallery: apollo11MoonGallery,
        },
      },
    ],
  },
]
