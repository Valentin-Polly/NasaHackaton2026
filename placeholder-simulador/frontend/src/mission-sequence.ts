import type { CelestialMarkerLocation } from './celestial-marker-types'
import type { PhotoGalleryData } from './gallery-data'
import type { Trajectory } from './trajectory-types'
import {
  apollo11FloridaGallery,
  apollo11MoonGallery,
  apollo12FloridaGallery,
  apollo12MoonGallery,
  apollo14FloridaGallery,
  apollo14MoonGallery,
} from './gallery-data'

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
  title: string
  titleHighlight: string
  summary: string
  steps: [MissionStep, ...MissionStep[]]
}

const lunarMarkerCoordinates = {
  selenographicLatitude: 0.67416,
  selenographicLongitude: 23.47314,
}

const kennedyLaunchCoordinates = {
  latitude: 28.5729,
  longitude: -80.649,
}

const apollo12LunarCoordinates = {
  selenographicLatitude: -3.01,
  selenographicLongitude: -23.42,
}

const apollo14LunarCoordinates = {
  selenographicLatitude: -3.65,
  selenographicLongitude: -17.47,
}

export const missionSequence: [MissionDefinition, ...MissionDefinition[]] = [
  {
    id: 'apollo-11',
    sequence: '01',
    protocol: 'MISIÓN / APOLLO 11',
    title: 'EL PRIMER',
    titleHighlight: 'ALUNIZAJE',
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
            coordinates: kennedyLaunchCoordinates,
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
  {
    id: 'apollo-12',
    sequence: '02',
    protocol: 'MISIÓN / APOLLO 12',
    title: 'ALUNIZAJE DE',
    titleHighlight: 'PRECISIÓN',
    summary: 'Sigue la misión Apollo 12 y su demostración de aterrizaje de precisión en la Luna.',
    steps: [
      {
        id: 'mission-2-step-1',
        title: 'Aterrizaje de precisión',
        description: 'Conoce cómo Apollo 12 llegó hasta la sonda Surveyor 3.',
        narrative: [
          [
            {
              text: 'El 19 de noviembre de 1969, el Apolo 12 aterrizó en el Océano de las Tormentas, a tan solo 160 metros de la sonda Surveyor 3, que había llegado dos años antes.',
            },
          ],
          [
            {
              text: 'Pero ¿cómo lograron aterrizar tan cerca de un objetivo en la superficie lunar?',
            },
          ],
          [
            {
              text: 'A diferencia del Apolo 11, esta misión buscaba demostrar que era posible realizar un aterrizaje de precisión, utilizando ',
            },
            { text: 'información previa del terreno', emphasis: true },
            { text: ' y una trayectoria planificada.' },
          ],
        ],
        marker: {
          location: {
            body: 'earth',
            coordinates: kennedyLaunchCoordinates,
          },
          label: 'Abrir galería del lanzamiento de Apollo 12 desde Florida',
          gallery: apollo12FloridaGallery,
        },
      },
      {
        id: 'mission-2-step-2',
        title: 'Trayectoria híbrida',
        description: 'Descubre la trayectoria que permitió a Apollo 12 llegar a la Luna con seguridad.',
        narrative: [
          [
            { text: 'El Apolo 12 también introdujo un cambio importante: utilizó una ' },
            { text: 'trayectoria híbrida', emphasis: true },
            { text: '.' },
          ],
          [
            {
              text: 'En las misiones anteriores se usaban trayectorias de retorno libre, que permitían regresar hacia la Tierra sin maniobras adicionales si surgía una emergencia.',
            },
          ],
          [
            {
              text: 'El Apolo 12 comenzó con esa trayectoria de seguridad, pero luego hizo una corrección que le permitió alcanzar condiciones de llegada óptimas.',
            },
          ],
        ],
      },
      {
        id: 'mission-2-step-3',
        title: 'Reconocimiento del terreno',
        description: 'Explora cómo las imágenes y las sombras ayudaron a elegir el lugar de descenso.',
        narrative: [
          [
            {
              text: 'Antes del aterrizaje, la NASA ya había estudiado la región mediante fotografías de las sondas Lunar Orbiter y mediciones realizadas por Surveyor 3.',
            },
          ],
          [
            {
              text: 'Esta información permitió identificar cráteres, estudiar las características del suelo y seleccionar un lugar adecuado para descender.',
            },
          ],
          [
            {
              text: 'Además, los astronautas aterrizaron con el Sol apenas sobre el horizonte, lo que producía sombras largas que ayudaban a reconocer la forma del terreno.',
            },
          ],
        ],
        image: {
          src: '/oceanus-procellarum-lro.png',
          alt: 'Vista de la Luna que muestra el Océano de las Tormentas, lugar de alunizaje del Apolo 12.',
        },
        marker: {
          location: {
            body: 'moon',
            coordinates: apollo12LunarCoordinates,
          },
          label: 'Abrir galería del alunizaje de Apollo 12 junto a Surveyor 3',
          gallery: apollo12MoonGallery,
        },
      },
    ],
  },
  {
    id: 'apollo-14',
    sequence: '03',
    protocol: 'MISIÓN / APOLLO 14',
    title: 'APOLO 14',
    titleHighlight: 'FRA MAURO',
    summary: 'El desafío de explorar las colinas de Fra Mauro.',
    steps: [
      {
        id: 'apollo-14-fra-mauro',
        title: '¿Por qué aterrizar en una región llena de colinas?',
        description: 'Conoce por qué Apollo 14 exploró el terreno accidentado de Fra Mauro.',
        narrative: [
          [
            {
              text: 'El 31 de enero de 1971, el Apolo 14 despegó desde el Centro Espacial Kennedy con destino a Fra Mauro, una región lunar caracterizada por sus colinas, pendientes y numerosos cráteres; sus ',
            },
            { text: 'accidentes', emphasis: true },
            { text: '.' },
          ],
          [
            {
              text: 'Pero ¿por qué la NASA eligió un terreno más accidentado que el de las misiones anteriores?',
            },
          ],
          [
            {
              text: 'Los científicos creían que allí podían encontrar materiales expulsados durante el gigantesco impacto que formó el Mar de las Lluvias.',
            },
          ],
          [
            {
              text: 'Estudiar estas rocas permitiría conocer mejor la historia geológica de la Luna, aunque significara explorar una región con mayores dificultades para aterrizar y desplazarse.',
            },
          ],
        ],
        marker: {
          location: {
            body: 'earth',
            coordinates: kennedyLaunchCoordinates,
          },
          label: 'Abrir galería del lanzamiento de Apollo 14 desde Florida',
          gallery: apollo14FloridaGallery,
        },
      },
      {
        id: 'apollo-14-terrain',
        title: '¿Qué dificultades presenta el relieve lunar?',
        description: 'Descubre cómo las pendientes, el regolito y los obstáculos afectan el recorrido.',
        narrative: [
          [
            {
              text: 'A diferencia de las grandes llanuras lunares, Fra Mauro presenta un terreno irregular, con desniveles, cráteres y pendientes que dificultan el desplazamiento.',
            },
          ],
          [
            { text: 'Una ' },
            { text: 'pendiente', emphasis: true },
            {
              text: ' representa la inclinación de una superficie respecto de la horizontal. Cuanto mayor es, más difícil puede resultar atravesarla, especialmente si el suelo es inestable.',
            },
          ],
          [
            { text: 'Además, la superficie lunar está cubierta de ' },
            { text: 'regolito', emphasis: true },
            {
              text: ', una capa de polvo y fragmentos de roca producida principalmente por impactos de meteoritos.',
            },
          ],
          [
            {
              text: 'La combinación de pendientes, suelo suelto y obstáculos puede dificultar el equilibrio, aumentar el esfuerzo físico y complicar la planificación de una ruta.',
            },
          ],
        ],
      },
      {
        id: 'apollo-14-lost',
        title: '¿Cómo es posible perderse en la Luna?',
        description: 'Acompaña a Shepard y Mitchell en su recorrido hacia el cráter Cone.',
        narrative: [
          [
            {
              text: 'Durante la segunda caminata lunar, los astronautas Alan Shepard y Edgar Mitchell intentaron alcanzar el borde del cráter Cone para recolectar muestras geológicas.',
            },
          ],
          [
            { text: 'Sin embargo, el recorrido fue mucho más complicado de lo esperado.' },
          ],
          [
            {
              text: 'Los numerosos cráteres pequeños, las pendientes y la dificultad para reconocer puntos de referencia hicieron que los astronautas perdieran la orientación y avanzaran lentamente.',
            },
          ],
          [
            {
              text: 'Aunque llegaron a estar a unas pocas decenas de metros del borde, tuvieron que regresar sin alcanzar su objetivo debido al tiempo y al oxígeno disponibles, sus ',
            },
            { text: 'recursos disponibles', emphasis: true },
            { text: '.' },
          ],
        ],
        image: {
          src: '/apollo14-recursos-disponibles.jpg',
          alt: 'Botellas de agua almacenadas, como ilustración de los recursos disponibles para una expedición.',
        },
        marker: {
          location: {
            body: 'moon',
            coordinates: apollo14LunarCoordinates,
          },
          label: 'Abrir galería de Apollo 14 en Fra Mauro',
          gallery: apollo14MoonGallery,
        },
      },
    ],
  },
]
