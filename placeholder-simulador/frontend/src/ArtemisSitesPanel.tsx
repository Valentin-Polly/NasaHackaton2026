import { useState } from 'react'
import { artemisSites } from './artemis-site-data'
import type { ArtemisSite } from './artemis-site-data'

type ArtemisSitesPanelProps = {
  selectedSite: ArtemisSite
  onSelectSite: (site: ArtemisSite) => void
}

const numberFormatter = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 3,
})

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function formatLatitude(latitude: number) {
  return `${formatNumber(Math.abs(latitude))}° ${latitude < 0 ? 'S' : 'N'}`
}

function formatLongitude(longitude: number) {
  return `${formatNumber(Math.abs(longitude))}° ${longitude < 0 ? 'O' : 'E'}`
}

function formatSiteId(siteId: string) {
  return siteId.replace('_', '-')
}

function getCategoryLabel(category: string) {
  if (category.includes('2022 & 2024')) return 'Candidato revisado en 2022 y 2024'
  if (category.includes('2024')) return 'Candidato actualizado en 2024'
  return 'Candidato de la propuesta inicial de 2022'
}

function getSourceLabel(source: string) {
  return source.replace('NASA Artemis III Selection', 'Selección de sitios Artemis III de NASA')
}

function ArtemisSitesPanel({ selectedSite, onSelectSite }: ArtemisSitesPanelProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <div className={`mission-panel${sidebarVisible ? '' : ' mission-panel--hidden'}`}>
      <aside
        id="mission-sidebar"
        className="mission-sidebar"
        aria-labelledby="artemis-sidebar-title"
        aria-hidden={!sidebarVisible}
      >
        <p className="mission-sidebar-eyebrow">
          <span className="mission-sidebar-status" />
          EXPLORACIÓN ARTEMIS
        </p>

        <div className="mission-sidebar-content">
          <p className="mission-sidebar-index">ARTEMIS · 17 CANDIDATOS</p>
          <h2 id="artemis-sidebar-title" className="mission-sidebar-title">
            POLO SUR
            <span>LUNAR</span>
          </h2>
          <p className="mission-sidebar-description">
            Elegí un sitio de la lista o tocá un marcador en la Luna para explorar sus datos.
          </p>

          <div className="artemis-site-picker">
            <label htmlFor="artemis-site-select">SITIO SELECCIONADO</label>
            <select
              id="artemis-site-select"
              value={selectedSite.site_id}
              onChange={(event) => {
                const site = artemisSites.find((candidate) => candidate.site_id === event.target.value)
                if (site) onSelectSite(site)
              }}
            >
              {artemisSites.map((site) => (
                <option key={site.site_id} value={site.site_id}>
                  {formatSiteId(site.site_id)} · {site.name}
                </option>
              ))}
            </select>
          </div>

          <section className="artemis-site-card" aria-labelledby="artemis-site-name">
            <p className="artemis-site-id">{formatSiteId(selectedSite.site_id)}</p>
            <h3 id="artemis-site-name">{selectedSite.name}</h3>
            <p className="artemis-site-category">{getCategoryLabel(selectedSite.category)}</p>

            <p className="artemis-site-coordinates">
              {formatLatitude(selectedSite.center_lat_deg)} · {formatLongitude(selectedSite.center_lon_deg)}
            </p>
            <p className="artemis-site-coordinate-label">Coordenadas sobre la Luna</p>

            <dl className="artemis-site-facts">
              <div>
                <dt>Luz solar</dt>
                <dd>{formatNumber(selectedSite.jan2027_sunlight_pct)}%</dd>
                <p>del tiempo estimado en enero de 2027</p>
              </div>
              <div>
                <dt>Comunicación con la Tierra</dt>
                <dd>{formatNumber(selectedSite.jan2027_dte_comm_pct)}%</dd>
                <p>del tiempo con conexión directa estimada</p>
              </div>
              <div>
                <dt>Pendiente del terreno</dt>
                <dd>{formatNumber(selectedSite.slope_lola_deg)}°</dd>
                <p>una inclinación menor facilita el aterrizaje</p>
              </div>
              <div>
                <dt>Superficie del sitio</dt>
                <dd>{formatNumber(selectedSite.area_km2)} km²</dd>
                <p>área aproximada estudiada</p>
              </div>
              <div>
                <dt>Altura respecto al nivel lunar medio</dt>
                <dd>
                  {selectedSite.elevation_lola_m > 0 ? '+' : ''}
                  {formatNumber(selectedSite.elevation_lola_m)} m
                </dd>
                <p>valor basado en mediciones del relieve lunar</p>
              </div>
              <div>
                <dt>Energía solar promedio</dt>
                <dd>{formatNumber(selectedSite.avg_solar_power_kw_m2)} kW/m²</dd>
                <p>energía recibida por cada metro cuadrado</p>
              </div>
            </dl>

            <details className="artemis-site-more">
              <summary>Más datos sobre el lugar</summary>
              <dl className="artemis-site-extra-facts">
                <div>
                  <dt>Altura máxima del Sol</dt>
                  <dd>{formatNumber(selectedSite.max_sun_elevation_deg)}°</dd>
                </div>
                <div>
                  <dt>Altura mínima del Sol</dt>
                  <dd>{formatNumber(selectedSite.min_sun_elevation_deg)}°</dd>
                </div>
                <div>
                  <dt>Altura máxima de la Tierra en el cielo</dt>
                  <dd>{formatNumber(selectedSite.max_earth_elevation_deg)}°</dd>
                </div>
                <div>
                  <dt>Altura mínima de la Tierra en el cielo</dt>
                  <dd>{formatNumber(selectedSite.min_earth_elevation_deg)}°</dd>
                </div>
                <div>
                  <dt>Relieve que puede tapar el cielo</dt>
                  <dd>{formatNumber(selectedSite.horizon_mask_deg)}°</dd>
                </div>
              </dl>
            </details>

            <p className="artemis-site-source">
              Fuente: {getSourceLabel(selectedSite.data_source)}.
            </p>
          </section>
        </div>

        <footer className="mission-sidebar-footer">
          <span>SITIOS ARTEMIS</span>
          <span>DATOS · ENERO 2027</span>
        </footer>
      </aside>
      <button
        className="mission-sidebar-toggle"
        type="button"
        aria-controls="mission-sidebar"
        aria-expanded={sidebarVisible}
        aria-label={sidebarVisible ? 'Ocultar panel de sitios Artemis' : 'Mostrar panel de sitios Artemis'}
        onClick={() => setSidebarVisible((visible) => !visible)}
      >
        <span aria-hidden="true">{sidebarVisible ? '←' : '→'}</span>
      </button>
    </div>
  )
}

export default ArtemisSitesPanel
