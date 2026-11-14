export type MissionStep = {
  id: string
  title: string
  description: string
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

export const missionSequence: [MissionDefinition, ...MissionDefinition[]] = [
  {
    id: 'mission-01',
    sequence: '01',
    protocol: 'PROTOCOLO / LUNAR-07',
    summary: 'Investiga una señal irregular detectada cerca de la Luna y determina su posible origen.',
    status: 'EN ESPERA',
    sector: 'ÓRBITA LUNAR',
    steps: [
      {
        id: 'detect-signal',
        title: 'Detectar la señal',
        description: 'Ubica la Luna y confirma visualmente la zona desde donde se origina la señal.',
      },
      {
        id: 'approach-moon',
        title: 'Aproximación lunar',
        description: 'Acércate a la superficie lunar para observar los detalles del área.',
      },
      {
        id: 'analyze-origin',
        title: 'Analizar el origen',
        description: 'Compara la dirección de la señal con el relieve y registra una posible fuente.',
      },
      {
        id: 'check-solar-activity',
        title: 'Verificar actividad solar',
        description: 'Observa el Sol y descarta una interferencia causada por actividad solar.',
      },
      {
        id: 'close-report',
        title: 'Cerrar el informe',
        description: 'Resume el hallazgo y confirma el cierre del protocolo de exploración.',
      },
    ],
  },
]
