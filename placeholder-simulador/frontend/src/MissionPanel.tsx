import { useState } from 'react'
import type { MissionDefinition } from './mission-sequence'

type MissionPanelProps = {
  mission: MissionDefinition
  currentStepIndex: number
  onStepChange: (index: number) => void
}

function MissionPanel({ mission, currentStepIndex, onStepChange }: MissionPanelProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const currentStep = mission.steps[currentStepIndex]
  const isLastStep = currentStepIndex === mission.steps.length - 1

  const selectStep = (index: number) => {
    onStepChange(index)
  }

  return (
    <div className={`mission-panel${sidebarVisible ? '' : ' mission-panel--hidden'}`}>
      <aside
        id="mission-sidebar"
        className="mission-sidebar"
        aria-labelledby="mission-sidebar-title"
        aria-hidden={!sidebarVisible}
      >
        <p className="mission-sidebar-eyebrow">
          <span className="mission-sidebar-status" />
          SISTEMA SOLAR <span>/</span> TRANSMISIÓN ACTIVA
        </p>

        <div className="mission-sidebar-content">
          <p className="mission-sidebar-index">{mission.protocol}</p>
          <h2 id="mission-sidebar-title" className="mission-sidebar-title">
            OBJETIVO
            <span>PRINCIPAL</span>
          </h2>
          <p className="mission-sidebar-description">{mission.summary}</p>

          <section className="mission-objective" aria-label="Objetivo de misión">
            <p className="mission-objective-label">
              PASO {String(currentStepIndex + 1).padStart(2, '0')} / {String(mission.steps.length).padStart(2, '0')}
            </p>
            <div className="mission-objective-content">
              <span className="mission-objective-number">
                {String(currentStepIndex + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{currentStep.title}</h3>
                <p>{currentStep.description}</p>
              </div>
            </div>
            <div
              className="mission-step-progress"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={mission.steps.length}
              aria-valuenow={currentStepIndex + 1}
              aria-valuetext={`Paso ${currentStepIndex + 1} de ${mission.steps.length}`}
            >
              <span style={{ width: `${((currentStepIndex + 1) / mission.steps.length) * 100}%` }} />
            </div>
            <div className="mission-step-navigation">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => selectStep(currentStepIndex - 1)}
              >
                ← ANTERIOR
              </button>
              <button
                type="button"
                onClick={() => selectStep(isLastStep ? 0 : currentStepIndex + 1)}
              >
                {isLastStep ? 'REINICIAR' : 'SIGUIENTE →'}
              </button>
            </div>
          </section>

          <div className="mission-readout">
            <p><span>ESTADO</span><strong>{mission.status}</strong></p>
            <p><span>SECTOR</span><strong>{mission.sector}</strong></p>
          </div>
        </div>

        <footer className="mission-sidebar-footer">
          <span>SECUENCIA DE EXPLORACIÓN</span>
          <span>{mission.sequence}</span>
        </footer>
      </aside>
      <button
        className="mission-sidebar-toggle"
        type="button"
        aria-controls="mission-sidebar"
        aria-expanded={sidebarVisible}
        aria-label={sidebarVisible ? 'Ocultar panel de misión' : 'Mostrar panel de misión'}
        onClick={() => setSidebarVisible((visible) => !visible)}
      >
        <span aria-hidden="true">{sidebarVisible ? '←' : '→'}</span>
      </button>
    </div>
  )
}

export default MissionPanel
