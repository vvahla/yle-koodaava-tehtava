import { useMemo, useState } from 'react'
import municipalityData from "./data/municipalities.json";
import './App.css'

const NATIONAL_NAME = 'Koko Suomi'

const numberFormatter = new Intl.NumberFormat('fi-FI')
const percentageFormatter = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

function formatNumber(value) {
  return numberFormatter.format(value)
}

function formatPercentage(value) {
  if (value === null) {
    return 'Ei saatavilla'
  }

  return `${percentageFormatter.format(value)} %`
}

function formatDifference(selectedShare, nationalShare) {
  if (selectedShare === null || nationalShare === null) {
    return 'Ei saatavilla'
  }

  const difference = selectedShare - nationalShare
  const sign = difference > 0 ? '+' : ''

  return `${sign}${percentageFormatter.format(difference)} prosenttiyksikköä`
}

function ComparisonBar({ label, share }) {
  const width = share === null ? 0 : Math.min(Math.max(share, 0), 100)

  return (
    <div className="comparison-bar">
      <div className="bar-label">
        <span>{label}</span>
        <strong>{formatPercentage(share)}</strong>
      </div>
      <div className="bar-track" aria-hidden="true">
        <div className="bar-fill" style={{ width: `${width}%` }}></div>
      </div>
    </div>
  )
}

function App() {
  const nationalData = municipalityData.find(
    (item) => item.municipality === NATIONAL_NAME
  )

  const municipalities = useMemo(
    () =>
      municipalityData
        .filter((item) => item.municipality !== NATIONAL_NAME)
        .sort((first, second) =>
          first.municipality.localeCompare(second.municipality, 'fi')
        ),
    []
  )

  const [selectedCode, setSelectedCode] = useState(
    municipalities[0]?.municipalityCode ?? ''
  )

  const selectedMunicipality = municipalities.find(
    (item) => item.municipalityCode === selectedCode
  )

  if (!selectedMunicipality || !nationalData) {
    return (
      <main className="page">
        <p>Paikallista aineistoa ei voitu näyttää.</p>
      </main>
    )
  }

  const shareIsMissing = selectedMunicipality.share === null

  return (
    <main className="page">
      <header className="intro">
        <p className="eyebrow">Kuntavertailu</p>
        <h1>Vieraskieliset lapset kunnittain</h1>
        <p>
          Valitse kunta ja vertaa vieraskielisten lasten osuutta koko maan
          tasoon.
        </p>
      </header>

      <section className="selector-section" aria-labelledby="municipality-label">
        <label id="municipality-label" htmlFor="municipality-select">
          Kunta
        </label>
        <select
          id="municipality-select"
          value={selectedCode}
          onChange={(event) => setSelectedCode(event.target.value)}
        >
          {municipalities.map((municipality) => (
            <option
              key={municipality.municipalityCode}
              value={municipality.municipalityCode}
            >
              {municipality.municipality}
            </option>
          ))}
        </select>
      </section>

      <section className="result" aria-live="polite">
        <div className="result-heading">
          <div>
            <p className="eyebrow">Valittu kunta</p>
            <h2>{selectedMunicipality.municipality}</h2>
          </div>
          <p className="share-value">
            {formatPercentage(selectedMunicipality.share)}
          </p>
        </div>

        {shareIsMissing && (
          <p className="notice">
            Osuutta ei voi laskea, koska lasten kokonaismäärä on nolla.
          </p>
        )}

        <dl className="stats">
          <div>
            <dt>Lapsia yhteensä</dt>
            <dd>{formatNumber(selectedMunicipality.totalChildren)}</dd>
          </div>
          <div>
            <dt>Vieraskielisiä lapsia</dt>
            <dd>{formatNumber(selectedMunicipality.foreignLanguageChildren)}</dd>
          </div>
          <div>
            <dt>Osuus</dt>
            <dd>{formatPercentage(selectedMunicipality.share)}</dd>
          </div>
          <div>
            <dt>Ero koko Suomeen</dt>
            <dd>
              {formatDifference(selectedMunicipality.share, nationalData.share)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="comparison" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading">Osuuden vertailu</h2>
        <ComparisonBar
          label={selectedMunicipality.municipality}
          share={selectedMunicipality.share}
        />
        <ComparisonBar label={NATIONAL_NAME} share={nationalData.share} />
      </section>
    </main>
  )
}

export default App
