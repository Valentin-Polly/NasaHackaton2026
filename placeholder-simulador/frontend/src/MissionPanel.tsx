import { useState } from 'react'
import type { MissionDefinition } from './mission-sequence'

type MissionPanelProps = {
  mission: MissionDefinition
  currentStepIndex: number
  onStepChange: (index: number) => void
  onPreviousMission: () => void
  onNextMission: () => void
  hasPreviousMission: boolean
  hasNextMission: boolean
}

function MissionPanel({
  mission,
  currentStepIndex,
  onStepChange,
  onPreviousMission,
  onNextMission,
  hasPreviousMission,
  hasNextMission,
}: MissionPanelProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const currentStep = mission.steps[currentStepIndex]
  const isLastStep = currentStepIndex === mission.steps.length - 1

  const isFirstStep = currentStepIndex === 0

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
          SISTEMA SOLAR
        </p>

        <div className="mission-sidebar-content">
          <p className="mission-sidebar-index">{mission.protocol}</p>
          <h2 id="mission-sidebar-title" className="mission-sidebar-title">
            {mission.title}
            <span>{mission.titleHighlight}</span>
          </h2>
          <p className="mission-sidebar-description">{mission.summary}</p>

          <section className="mission-objective" aria-label="Objetivo de misión">
            <p className="mission-objective-label">
              ETAPA {String(currentStepIndex + 1).padStart(2, '0')} / {String(mission.steps.length).padStart(2, '0')}
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
                disabled={isFirstStep && !hasPreviousMission}
                onClick={() => {
                  if (isFirstStep) {
                    onPreviousMission()
                  } else {
                    onStepChange(currentStepIndex - 1)
                  }
                }}
              >
                {isFirstStep && hasPreviousMission ? '← MISIÓN ANTERIOR' : '← ANTERIOR'}
              </button>
              <button
                type="button"
                disabled={isLastStep && !hasNextMission}
                onClick={() => {
                  if (isLastStep) {
                    onNextMission()
                  } else {
                    onStepChange(currentStepIndex + 1)
                  }
                }}
              >
                {isLastStep && hasNextMission ? 'SIGUIENTE MISIÓN →' : 'SIGUIENTE →'}
              </button>
            </div>
          </section>

          {currentStep.narrative && (
            <div className="mission-narrative">
              {currentStep.narrative.map((paragraph, paragraphIndex) => (
                <p key={`${currentStep.id}-narrative-${paragraphIndex}`}>
                  {paragraph.map((segment, segmentIndex) => (
                    segment.emphasis
                      ? <strong key={`${currentStep.id}-emphasis-${segmentIndex}`}>{segment.text}</strong>
                      : <span key={`${currentStep.id}-text-${segmentIndex}`}>{segment.text}</span>
                  ))}
                </p>
              ))}
            </div>
          )}
          {currentStep.image && (
            <figure className="mission-narrative-figure">
              <img
                className="mission-narrative-image"
                src={currentStep.image.src}
                alt={currentStep.image.alt}
                loading="lazy"
              />
              {currentStep.image.caption && (
                <figcaption className="mission-image-caption">
                  <em>
                    <strong>{currentStep.image.caption.title}</strong>{' '}
                    {currentStep.image.caption.text}
                  </em>
                </figcaption>
              )}
            </figure>
          )}
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
