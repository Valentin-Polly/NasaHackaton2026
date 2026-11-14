import type { CelestialMarkerLocation } from './celestial-marker-types'
import type { PhotoGalleryData } from './gallery-data'
import { apollo11FloridaGallery, apollo11MoonGallery } from './gallery-data'

export type MissionStep = {
  id: string
  title: string
  description: string
  marker: {
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
  selenographicLatitude: -15 + Math.random() * 30,
  selenographicLongitude: -120 + Math.random() * 60,
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
        id: 'lunar-exploration',
        title: 'Exploración lunar',
        description: 'Continúa hacia un punto placeholder elegido al azar sobre la superficie lunar.',
        marker: {
          location: {
            body: 'moon',
            coordinates: lunarMarkerCoordinates,
          },
          label: 'Abrir galería placeholder de la Luna',
          gallery: apollo11MoonGallery,
        },
      },
    ],
  },
]
