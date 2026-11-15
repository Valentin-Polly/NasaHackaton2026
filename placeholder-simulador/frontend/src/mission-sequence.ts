import type { CelestialMarkerLocation } from './celestial-marker-types'
import type { PhotoGalleryData } from './gallery-data'
import type { Trajectory } from './trajectory-types'
import {
  apollo11FloridaGallery,
  apollo11EarthParkingOrbitGallery,
  apollo11MoonGallery,
  apollo12FloridaGallery,
  apollo12MoonGallery,
  apollo14FloridaGallery,
  apollo14MoonGallery,
  apollo15FloridaGallery,
  apollo15MoonGallery,
  apollo16FloridaGallery,
  apollo16MoonGallery,
  apollo17FloridaGallery,
  apollo17MoonGallery,
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
    caption?: {
      title: string
      text: string
    }
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

const marChiquitaCoordinates = {
  latitude: -30.67296,
  longitude: -62.53589,
}

const apollo12LunarCoordinates = {
  selenographicLatitude: -3.01,
  selenographicLongitude: -23.42,
}

const apollo14LunarCoordinates = {
  selenographicLatitude: -3.65,
  selenographicLongitude: -17.47,
}

const kennedyPlatform39ACoordinates = {
  latitude: 28.6083,
  longitude: -80.6041,
}

const apollo15LunarCoordinates = {
  selenographicLatitude: 26.1322,
  selenographicLongitude: 3.6339,
}

const apollo16LunarCoordinates = {
  selenographicLatitude: -8.9734,
  selenographicLongitude: 15.5011,
}

const apollo17LunarCoordinates = {
  selenographicLatitude: 20.1908,
  selenographicLongitude: 30.7717,
}

export const missionSequence: [MissionDefinition, ...MissionDefinition[]] = [
  {
    id: 'apollo-11',
    sequence: '01',
    protocol: 'MISIÓN / APOLLO 11',
    title: 'EL PRIMER',
    titleHighlight: 'ALUNIZAJE',
    summary: 'Scrolleá para ver más información.',
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
        marker: {
          location: {
            body: 'earth',
            coordinates: marChiquitaCoordinates,
          },
          label: 'Abrir imagen de la órbita terrestre de estacionamiento del Apolo 11',
          gallery: apollo11EarthParkingOrbitGallery,
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
  {
    id: 'apollo-15',
    sequence: '04',
    protocol: 'MISIÓN / APOLLO 15',
    title: 'APOLO 15',
    titleHighlight: 'CARRERA LUNAR',
    summary: 'Una carrera contra el tiempo lunar.',
    steps: [
      {
        id: 'apollo-15-lunar-day',
        title: '¿Cuánto dura un día en la Luna?',
        description: 'Descubre cuánto duran el día y la noche en la superficie lunar.',
        narrative: [
          [
            {
              text: 'El 26 de julio de 1971, el Apolo 15 despegó desde el Centro Espacial Kennedy con destino a Hadley Rille, una región rodeada de montañas y atravesada por una enorme grieta lunar.',
            },
          ],
          [
            {
              text: 'Esta misión fue la primera en permanecer casi tres días terrestres sobre la superficie de la Luna.',
            },
          ],
          [
            { text: 'Pero ¿cuánto dura realmente un ' },
            { text: 'día lunar', emphasis: true },
            { text: '?' },
          ],
          [
            {
              text: 'Mientras que en la Tierra el ciclo entre dos amaneceres dura aproximadamente 24 horas, en la Luna dura 29,5 días terrestres.',
            },
          ],
          [
            {
              text: 'Esto significa que un lugar de la superficie lunar puede experimentar aproximadamente 14 días de luz continua, seguidos de 14 días de oscuridad.',
            },
          ],
        ],
        marker: {
          location: {
            body: 'earth',
            coordinates: kennedyPlatform39ACoordinates,
          },
          label: 'Abrir galería del lanzamiento de Apollo 15 desde la plataforma 39A',
          gallery: apollo15FloridaGallery,
        },
      },
      {
        id: 'apollo-15-sun-position',
        title: '¿Cómo cambió la posición del Sol durante la misión?',
        description: 'Sigue el cambio de la iluminación lunar durante la exploración.',
        narrative: [
          [
            {
              text: 'Cuando el Apolo 15 aterrizó, el Sol estaba a tan solo 12,1° sobre el horizonte lunar.',
            },
          ],
          [
            { text: 'Durante las siguientes 67 horas, los astronautas realizaron tres caminatas y exploraron la superficie utilizando por primera vez un ' },
            { text: 'vehículo lunar', emphasis: true },
            { text: '.' },
          ],
          [
            {
              text: 'Mientras tanto, el Sol continuó ascendiendo lentamente hasta alcanzar casi 45° al momento del despegue.',
            },
          ],
          [
            {
              text: 'Este cambio no solo modificó las sombras del terreno, sino también la cantidad de energía solar recibida por las superficies y sus temperaturas.',
            },
          ],
          [
            {
              text: 'En la Luna, donde prácticamente no hay atmósfera que distribuya el calor, la exposición directa al Sol influye mucho sobre la temperatura del suelo y de los aparatos.',
            },
          ],
        ],
      },
      {
        id: 'apollo-15-lunar-night',
        title: '¿Qué pasaría si una misión permaneciera durante la noche lunar?',
        description: 'Explora cómo la oscuridad y el frío afectarían una misión lunar.',
        narrative: [
          [
            {
              text: 'Aunque los astronautas del Apolo 15 permanecieron casi 67 horas en la superficie, todavía faltaban aproximadamente 13 días terrestres para el siguiente atardecer cuando llegaron.',
            },
          ],
          [
            {
              text: 'Sin embargo, quedarse durante toda la noche lunar habría sido un desafío enorme.',
            },
          ],
          [
            {
              text: 'Durante unas dos semanas, el sitio de aterrizaje dejaría de recibir luz solar directa y las temperaturas de las superficies expuestas podrían descender considerablemente.',
            },
          ],
          [
            {
              text: 'Esto dificultaría la generación de energía mediante paneles solares, dificultando la gestión de recursos en general.',
            },
          ],
        ],
        image: {
          src: '/apollo15-muestra-lunar.jpg',
          alt: 'Muestra de roca lunar recolectada durante la misión Apollo 15.',
          caption: {
            title: 'Basalto lunar:',
            text: 'Muestra 15486, recolectada en Dune durante el Apolo 15.',
          },
        },
        marker: {
          location: {
            body: 'moon',
            coordinates: apollo15LunarCoordinates,
          },
          label: 'Abrir galería de Apollo 15 en Hadley Rille',
          gallery: apollo15MoonGallery,
        },
      },
    ],
  },
  {
    id: 'apollo-16',
    sequence: '05',
    protocol: 'MISIÓN / APOLLO 16',
    title: 'APOLO 16',
    titleHighlight: 'TIERRAS ALTAS',
    summary: 'Los secretos de las tierras altas lunares.',
    steps: [
      {
        id: 'apollo-16-highlands',
        title: '¿Por qué algunas regiones de la Luna son más claras que otras?',
        description: 'Descubre qué diferencia a las tierras altas lunares.',
        narrative: [
          [
            {
              text: 'El 16 de abril de 1972, el Apolo 16 despegó desde el Centro Espacial Kennedy con destino a Descartes, una región de las ',
            },
            { text: 'tierras altas lunares', emphasis: true },
            { text: '.' },
          ],
          [
            {
              text: 'Pero ¿qué diferencia a estas regiones de las grandes llanuras oscuras que observamos desde la Tierra?',
            },
          ],
          [
            {
              text: 'La NASA eligió Descartes para estudiar estas tierras y comprender mejor cómo se formó la corteza de la Luna, ya que son más antiguas.',
            },
          ],
        ],
        marker: {
          location: {
            body: 'earth',
            coordinates: kennedyPlatform39ACoordinates,
          },
          label: 'Abrir galería del lanzamiento de Apollo 16 desde la plataforma 39A',
          gallery: apollo16FloridaGallery,
        },
      },
      {
        id: 'apollo-16-rocks',
        title: '¿Qué pueden revelar las rocas sobre el pasado lunar?',
        description: 'Conoce qué descubrieron las muestras de la región de Descartes.',
        narrative: [
          [
            {
              text: 'Antes de la misión, los científicos pensaban que algunas formaciones de Descartes se habían originado por actividad volcánica.',
            },
          ],
          [
            { text: 'Sin embargo, cuando los astronautas comenzaron a recolectar muestras, encontraron algo inesperado: la mayoría eran ' },
            { text: 'brechas de impacto', emphasis: true },
            {
              text: ', rocas formadas por fragmentos de otras rocas que quedaron unidos después de impactos de meteoritos.',
            },
          ],
          [
            { text: 'También encontraron anortositas, rocas que forman parte de la antigua corteza lunar, demostrando que los ' },
            { text: 'impactos de meteoritos', emphasis: true },
            { text: ' tuvieron un papel muy importante en la formación del paisaje.' },
          ],
        ],
      },
      {
        id: 'apollo-16-north-ray',
        title: '¿Cómo podemos estudiar el interior de la Luna sin excavar?',
        description: 'Explora cómo los cráteres dejan expuestas rocas del interior lunar.',
        narrative: [
          [
            {
              text: 'Durante su exploración, los astronautas del Apolo 16 visitaron las cercanías del cráter North Ray, de aproximadamente un kilómetro de diámetro y 230 metros de profundidad.',
            },
          ],
          [
            {
              text: 'Pero ¿por qué visitar un cráter puede ayudarnos a conocer lo que hay debajo de la superficie?',
            },
          ],
          [
            {
              text: 'Cuando un meteorito impacta contra la Luna, libera una enorme cantidad de energía y expulsa materiales que estaban enterrados a distintas profundidades.',
            },
          ],
          [
            {
              text: 'Estos fragmentos quedan dispersos alrededor del cráter y permiten estudiar rocas que normalmente serían inaccesibles.',
            },
          ],
          [
            {
              text: 'En North Ray, los astronautas pudieron recolectar muestras de este material expulsado.',
            },
          ],
        ],
        image: {
          src: '/apollo16-lunar-mapping-camera.jpg',
          alt: 'Cámara de cartografía lunar utilizada durante las misiones Apolo.',
          caption: {
            title: 'Lunar Mapping Camera:',
            text: 'Sistema fotográfico utilizado en las misiones Apolo 15, 16 y 17 para cartografiar la superficie lunar desde la órbita.',
          },
        },
        marker: {
          location: {
            body: 'moon',
            coordinates: apollo16LunarCoordinates,
          },
          label: 'Abrir galería de Apollo 16 en Descartes',
          gallery: apollo16MoonGallery,
        },
      },
    ],
  },
  {
    id: 'apollo-17',
    sequence: '06',
    protocol: 'MISIÓN / APOLLO 17',
    title: 'APOLO 17',
    titleHighlight: 'INTERIOR LUNAR',
    summary: 'Explora los secretos del interior lunar y las variaciones de gravedad.',
    steps: [
      {
        id: 'apollo-17-lunar-gravity',
        title: '¿Por qué pesamos menos en la Luna?',
        description: 'Compara la gravedad terrestre con la gravedad lunar.',
        narrative: [
          [
            {
              text: 'El 7 de diciembre de 1972, el Apolo 17 despegó desde el Centro Espacial Kennedy con destino al valle Taurus-Littrow, convirtiéndose en la última misión tripulada del programa Apolo en aterrizar en la Luna.',
            },
          ],
          [
            { text: 'La ' },
            { text: 'gravedad lunar', emphasis: true },
            {
              text: ' es aproximadamente un 83 % menor que la terrestre. Esto significa que una persona que pesa 60 kg en la Tierra sentiría un peso equivalente al de unos 10 kg en la Luna.',
            },
          ],
        ],
        marker: {
          location: {
            body: 'earth',
            coordinates: kennedyPlatform39ACoordinates,
          },
          label: 'Abrir galería del lanzamiento de Apollo 17 desde la plataforma 39A',
          gallery: apollo17FloridaGallery,
        },
      },
      {
        id: 'apollo-17-gravity-anomalies',
        title: '¿La gravedad es igual en toda la Luna?',
        description: 'Descubre cómo las variaciones de gravedad revelan materiales bajo la superficie.',
        narrative: [
          [
            {
              text: 'Aunque solemos hablar de la gravedad lunar como un valor constante de 1,62 m/s², en realidad presenta pequeñas variaciones según la región.',
            },
          ],
          [
            {
              text: 'Estas diferencias se relacionan con la elevación del terreno y la distribución de materiales bajo la superficie. Por ejemplo, una zona con rocas más densas puede producir una atracción gravitatoria ligeramente mayor.',
            },
          ],
          [
            { text: 'Estudiar estas diferencias, conocidas como ' },
            { text: 'anomalías gravitatorias', emphasis: true },
            {
              text: ', permite obtener información sobre la estructura interna de la Luna, incluso de materiales que no podemos observar directamente.',
            },
          ],
        ],
      },
      {
        id: 'apollo-17-traverse-gravimeter',
        title: '¿Cómo podemos descubrir qué hay debajo del suelo lunar?',
        description: 'Conoce el gravímetro portátil usado durante los recorridos por Taurus-Littrow.',
        narrative: [
          [
            {
              text: 'Durante el Apolo 17, los astronautas utilizaron un instrumento llamado Traverse Gravimeter, un gravímetro portátil diseñado para medir pequeñas variaciones de gravedad en distintos puntos de la superficie.',
            },
          ],
          [
            {
              text: 'El instrumento fue transportado en el vehículo lunar y permitió realizar mediciones durante los recorridos por el valle Taurus-Littrow.',
            },
          ],
        ],
        image: {
          src: '/apollo17-traverse-gravimeter.jpg',
          alt: 'El gravímetro Traverse del Apolo 17.',
          caption: {
            title: 'Gravímetro del Apolo 17:',
            text: 'Instrumento utilizado para medir pequeñas variaciones de la gravedad lunar y estudiar la composición del subsuelo.',
          },
        },
        marker: {
          location: {
            body: 'moon',
            coordinates: apollo17LunarCoordinates,
          },
          label: 'Abrir galería de Apollo 17 en el valle Taurus-Littrow',
          gallery: apollo17MoonGallery,
        },
      },
    ],
  },
]
