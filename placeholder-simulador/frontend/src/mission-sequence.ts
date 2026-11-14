import type { CelestialMarkerLocation } from './celestial-marker-types'
import type { PhotoGalleryData } from './gallery-data'
import type { Trajectory } from './trajectory-types'
import { apollo11FloridaGallery, apollo11MoonGallery } from './gallery-data'

export type MissionTextSegment = {
  text: string
  emphasis?: boolean
}

export type MissionStep = {
  id: string
  title: string
  description: string
  narrative?: MissionTextSegment[][]
  image?: {
    src: string
    alt: string
  }
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
    summary: 'Sigue la misión desde su punto de lanzamiento el Mar de la Tranquilidad.',
    steps: [
      {
        id: 'florida-launch',
        title: 'Punto de lanzamiento',
        description: 'Explora el sitio de lanzamiento de Apollo 11 en Florida.',
        narrative: [
          [
            {
              text: 'A las 9:32 de la mañana, hora de Florida, el Apolo 11 despegó desde el Centro Espacial Kennedy. Pero ¿por qué exactamente a esa hora?',
            },
          ],
          [
            { text: 'La NASA debía aprovechar una ' },
            { text: 'ventana de lanzamiento', emphasis: true },
            {
              text: ' para que la nave Saturn V pudiera interceptar la posición futura de la Luna (diferente de la del lanzamiento, porque está en movimiento).',
            },
          ],
          [
            {
              text: 'Particularmente, la NASA quería una iluminación poco vertical para que los astronautas pudieran observar bien los cráteres en el Mar de la Tranquilidad.',
            },
          ],
        ],
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
        narrative: [
          [
            { text: 'Una ' },
            { text: 'ventana de lanzamiento', emphasis: true },
            {
              text: ' es el tiempo donde una nave puede despegar y cumplir los objetivos propuestos.',
            },
          ],
          [
            { text: 'La ventana del Apolo 11 fue de aproximadamente ' },
            { text: '4 horas', emphasis: true },
            {
              text: ', desde las 9:22 a las 13:54, por lo que salió justo al inicio de la ventana.',
            },
          ],
          [
            {
              text: 'Elegirla depende de la posición de la Luna, el Sol, los otros planetas, el giro de la Tierra, la iluminación y el combustible, entre otros factores.',
            },
          ],
        ],
        trajectory: {
          segments: [
            {
              type: 'surface-circle',
              id: 'earth-parking-orbit',
              body: 'earth',
              poleLatitude: 56.6293,
              poleLongitude: -86.4745,
              angularRadius: 89.6776,
            },
            {
              type: 'surface-circle',
              id: 'moon-approach-orbit',
              body: 'moon',
              poleLatitude: -81.33,
              poleLongitude: 10.27,
              angularRadius: 86.333,
            },
            {
              type: 'parabola',
              fromCircle: 'earth-parking-orbit',
              toCircle: 'moon-approach-orbit',
              fromAngle: 0,
              toAngle: 0,
              controlPoint: [4.5, 0.3, 0],
            },
          ],
        },
      },
      {
        id: 'lunar-exploration',
        title: 'Exploración lunar',
        description: 'Explora Tranquility Base, el lugar exacto donde alunizó Apollo 11.',
        narrative: [
          [
            { text: 'Perder la ' },
            { text: 'ventana de lanzamiento', emphasis: true },
            {
              text: ' puede significar reprogramar la misión para mucho tiempo después, que puede implicar un gran costo económico.',
            },
          ],
          [
            {
              text: 'Por ejemplo, la misión InSight a Marte perdió su ventana por una fuga en uno de los instrumentos científicos, retrasando 26 meses su lanzamiento.',
            },
          ],
        ],
        image: {
          src: '/insight-mars-solar-panels.jpg',
          alt: 'Preparación del aterrizador InSight con sus paneles solares desplegados en una sala limpia.',
        },
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
