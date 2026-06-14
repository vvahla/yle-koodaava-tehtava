import { useMemo, useState } from 'react'
import municipalityData from "./data/municipalities.json";
import './App.css'

const NATIONAL_NAME = 'Koko Suomi'

const numberFormatter = new Intl.NumberFormat('fi-FI')
const percentageFormatter = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function isCalculatedShare(value) {
  return value !== null && Number.isFinite(value)
}

function formatNumber(value) {
  if (value === null || !Number.isFinite(value)) {
    return 'Tieto puuttuu'
  }

  return numberFormatter.format(value)
}

function formatPercentage(value) {
  if (!isCalculatedShare(value)) {
    return 'Ei laskettavaa osuutta'
  }

  return `${percentageFormatter.format(value)} %`
}

function formatPercentageText(value) {
  if (!isCalculatedShare(value)) {
    return 'ei ole laskettavissa'
  }

  return `${percentageFormatter.format(value)} prosenttia`
}

function getLocationText(municipality) {
  if (municipality === 'Helsinki') {
    return 'Helsingissä'
  }

  return `Kunnassa ${municipality}`
}

function getComparisonText(selectedMunicipality, nationalShare) {
  if (!isCalculatedShare(selectedMunicipality.share)) {
    if (selectedMunicipality.totalChildren === 0) {
      return 'Koska kunnassa ei ole varhaiskasvatukseen osallistuneita lapsia, kunnan osuutta ei voi verrata koko maan osuuteen.'
    }

    return 'Kunnan osuutta ei voi verrata koko maan osuuteen, koska osuutta ei voi laskea.'
  }

  if (!isCalculatedShare(nationalShare)) {
    return 'Kunnan osuutta ei voi verrata koko maan osuuteen, koska koko maan osuutta ei voi laskea.'
  }

  const difference = selectedMunicipality.share - nationalShare
  const absoluteDifference = Math.abs(difference)
  const formattedDifference = percentageFormatter.format(absoluteDifference)

  if (absoluteDifference < 0.005) {
    return 'Se on samalla tasolla kuin koko maassa.'
  }

  const direction = difference > 0 ? 'enemmän' : 'vähemmän'

  return `Se on ${formattedDifference} prosenttiyksikköä ${direction} kuin koko maassa.`
}

function ComparisonBar({ label, share, variant = 'primary' }) {
  const width = isCalculatedShare(share) ? Math.min(Math.max(share, 0), 100) : 0

  return (
    <div className={`comparison-bar ${variant}`}>
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

  const shareIsCalculated = isCalculatedShare(selectedMunicipality.share)
  const hasNoForeignLanguageChildren =
    shareIsCalculated &&
    selectedMunicipality.totalChildren > 0 &&
    selectedMunicipality.foreignLanguageChildren === 0
  const hasNoChildren = selectedMunicipality.totalChildren === 0
  const mainSentence = `${getLocationText(
    selectedMunicipality.municipality
  )} vieraskielisten lasten osuus varhaiskasvatuksessa on ${formatPercentageText(
    selectedMunicipality.share
  )}.`

  return (
    <main className="page">
      <header className="intro">
        <p className="eyebrow">Kuntavertailu</p>
        <h1>Katso, kuinka vieraskielisten lasten osuus vaihtelee kunnittain</h1>
        <p>
          Valitse kunta ja katso, kuinka suuri osuus varhaiskasvatuksessa
          olevista lapsista on vieraskielisiä. Vertailukohtana on koko maan
          osuus.
        </p>
      </header>

      <section
        className="interactive-card"
        aria-label="Kuntakohtainen vertailu"
      >
        <div
          className="selector-section"
          aria-labelledby="municipality-label"
        >
          <div>
            <label id="municipality-label" htmlFor="municipality-select">
              Valitse kunta
            </label>
            <p>
              Lista on aakkosjärjestyksessä. Koko Suomi näkyy vain vertailussa.
            </p>
          </div>
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
        </div>

        <div
          key={selectedMunicipality.municipalityCode}
          className="result-card"
          aria-live="polite"
        >
          <div className="result-kicker">Kunnan tilanne</div>
          <div className="result-lede">
            <h2>{selectedMunicipality.municipality}</h2>
            <p className="main-percentage">
              {formatPercentage(selectedMunicipality.share)}
            </p>
          </div>

          {!shareIsCalculated ? (
            <p className="notice">
              {hasNoChildren
                ? 'Osuutta ei voi laskea, koska kunnassa ei ole lainkaan varhaiskasvatukseen osallistuneita lapsia.'
                : 'Osuutta ei voi laskea, koska aineistosta puuttuu laskentaan tarvittava tieto.'}
            </p>
          ) : (
            <>
              <p className="story-sentence">{mainSentence}</p>
              {hasNoForeignLanguageChildren && (
                <p className="notice">
                  Kunnassa ei ole vieraskielisiä
                  varhaiskasvatukseen osallistuneita lapsia.
                </p>
              )}
            </>
          )}

          <p className="comparison-sentence">
            {getComparisonText(selectedMunicipality, nationalData.share)}
          </p>

          <dl className="stats" aria-label="Kunnan luvut">
            <div>
              <dt>Lapsia yhteensä</dt>
              <dd>{formatNumber(selectedMunicipality.totalChildren)}</dd>
            </div>
            <div>
              <dt>Vieraskielisiä lapsia</dt>
              <dd>
                {formatNumber(selectedMunicipality.foreignLanguageChildren)}
              </dd>
            </div>
            <div>
              <dt>Koko maan osuus</dt>
              <dd>{formatPercentage(nationalData.share)}</dd>
            </div>
          </dl>
        </div>

        <section className="comparison" aria-labelledby="comparison-heading">
          <div className="section-heading">
            <h2 id="comparison-heading">Osuuden vertailu</h2>
            <p>Vieraskielisten lasten osuus varhaiskasvatuksessa.</p>
          </div>
          <ComparisonBar
            label={selectedMunicipality.municipality}
            share={selectedMunicipality.share}
          />
          <ComparisonBar
            label={NATIONAL_NAME}
            share={nationalData.share}
            variant="secondary"
          />
        </section>
      </section>

      <p className="source-note">
        Lähde: Tilastokeskus
      </p>
    </main>
  )
}

export default App
