import { useState } from 'react'
import type { LandingSiteResult, LunarOptimizationResult } from './lunarOptimizer'
import type { MissionDefinition } from './mission-sequence'

type MissionPanelProps = {
  mission: MissionDefinition
  currentStepIndex: number
  onStepChange: (index: number) => void
  launchDateTime: string
  onLaunchDateTimeChange: (value: string) => void
  optimization: LunarOptimizationResult | null
}

function formatUtc(value: string) {
  return `${new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value))} UTC`
}

function formatCondition(value: boolean | null) {
  if (value === null) return 'Sin dato puntual'
  return value ? 'Sí' : 'No'
}

function SiteMetrics({ site }: { site: LandingSiteResult }) {
  return (
    <div className="lunar-site-metrics">
      <span>Score {site.score.toFixed(1)}/100</span>
      <span>Δv {site.totalDeltaV.toFixed(2)} km/s</span>
      <span>Espera {site.hoursWaitingInOrbit.toFixed(0)} h</span>
    </div>
  )
}

function MissionPanel({
  mission,
  currentStepIndex,
  onStepChange,
  launchDateTime,
  onLaunchDateTimeChange,
  optimization,
}: MissionPanelProps) {
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
          SISTEMA SOLAR
        </p>

        <div className="mission-sidebar-content">
          <p className="mission-sidebar-index">{mission.protocol}</p>
          <h2 id="mission-sidebar-title" className="mission-sidebar-title">
            EL PRIMER
            <span>ALUNIZAJE</span>
          </h2>
          <p className="mission-sidebar-description">{mission.summary}</p>

          <section className="lunar-optimizer" aria-labelledby="lunar-optimizer-title">
            <h3 id="lunar-optimizer-title">OPTIMIZADOR DE ALUNIZAJE</h3>
            <label htmlFor="launch-datetime">Despegue desde Cabo Cañaveral (hora local)</label>
            <input
              id="launch-datetime"
              type="datetime-local"
              step={60}
              value={launchDateTime}
              onChange={(event) => onLaunchDateTimeChange(event.target.value)}
            />
            <p className="lunar-timezone-note">Se interpreta en la zona horaria de Florida (EST/EDT); los resultados se muestran en UTC.</p>

            {optimization ? (
              <>
                <p className="lunar-optimizer-arrival">
                  Llegada estimada a órbita lunar: {formatUtc(optimization.estimatedArrivalUtc)}
                </p>
                <article className="lunar-optimal-site">
                  <p className="lunar-optimal-site-label">SITIO ÓPTIMO</p>
                  <h4>{optimization.optimalSite.name}</h4>
                  <p className="lunar-landing-time">
                    Alunizaje aprox.: {formatUtc(optimization.optimalSite.optimalLandingUtc)}
                  </p>
                  <SiteMetrics site={optimization.optimalSite} />
                  <dl className="lunar-delta-v">
                    <div><dt>Ascenso neto</dt><dd>{optimization.optimalSite.deltaV.launch.toFixed(2)} km/s</dd></div>
                    <div><dt>TLI</dt><dd>{optimization.optimalSite.deltaV.transLunarInjection.toFixed(2)} km/s</dd></div>
                    <div><dt>Inserción lunar</dt><dd>{optimization.optimalSite.deltaV.lunarOrbitInsertion.toFixed(2)} km/s</dd></div>
                    <div><dt>Cambio de plano</dt><dd>{optimization.optimalSite.deltaV.planeChange.toFixed(2)} km/s</dd></div>
                    <div><dt>Descenso propulsivo</dt><dd>{optimization.optimalSite.deltaV.poweredDescent.toFixed(2)} km/s</dd></div>
                    <div><dt>Evasión de obstáculos</dt><dd>{optimization.optimalSite.deltaV.obstacleAvoidance.toFixed(2)} km/s</dd></div>
                  </dl>
                  <p className="lunar-conditions">
                    Luz solar: {formatCondition(optimization.optimalSite.isSunlit)}
                    {' · '}DTE: {formatCondition(optimization.optimalSite.hasDteComm)}
                    {' · '}Pendiente: {optimization.optimalSite.slopeDegrees.toFixed(1)}°
                  </p>
                  {optimization.optimalSite.usedMonthlyFallback && (
                    <p className="lunar-fallback-note">
                      Indicadores basados en porcentajes mensuales; no hay efeméride puntual.
                    </p>
                  )}
                  {optimization.optimalSite.psrProximityKm !== null && (
                    <p className="lunar-conditions">
                      Proximidad a PSR: {optimization.optimalSite.psrProximityKm.toFixed(1)} km
                    </p>
                  )}
                </article>
                <div className="lunar-alternatives">
                  <h4>TOP 5 ALTERNATIVAS</h4>
                  <ol>
                    {optimization.alternatives.map((site, index) => (
                      <li key={site.siteId}>
                        <span className="lunar-alternative-rank">{String(index + 2).padStart(2, '0')}</span>
                        <div>
                          <strong>{site.name}</strong>
                          <SiteMetrics site={site} />
                          <span className="lunar-alternative-landing">
                            Aterrizaje: {formatUtc(site.optimalLandingUtc)}
                          </span>
                          <span className="lunar-alternative-landing">
                            Luz: {formatCondition(site.isSunlit)} · DTE: {formatCondition(site.hasDteComm)}
                            {' · '}Pendiente: {site.slopeDegrees.toFixed(1)}°
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                {optimization.warnings.map((warning) => (
                  <p className="lunar-optimizer-warning" key={warning}>{warning}</p>
                ))}
              </>
            ) : (
              <p className="lunar-optimizer-arrival">Ingresa una fecha y hora válidas para calcular.</p>
            )}
          </section>

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
