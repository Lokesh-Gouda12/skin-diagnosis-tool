import { useState } from 'react'
import axios from 'axios'
import { conditions, abcde } from './conditions'
import './App.css'

function Swatch({ id }) {
  switch (id) {
    case 'nv':
      return <svg viewBox="0 0 64 64" className="swatch"><circle cx="32" cy="32" r="20" fill="var(--ink)" opacity="0.85" /></svg>
    case 'mel':
      return <svg viewBox="0 0 64 64" className="swatch"><path d="M32 10 L44 22 L52 34 L44 50 L28 54 L14 42 L12 26 L22 14 Z" fill="var(--coral)" /></svg>
    case 'bkl':
      return <svg viewBox="0 0 64 64" className="swatch"><circle cx="24" cy="26" r="9" fill="var(--ink-soft)" /><circle cx="38" cy="34" r="12" fill="var(--ink-soft)" opacity="0.7" /><circle cx="30" cy="42" r="6" fill="var(--ink-soft)" opacity="0.5" /></svg>
    case 'bcc':
      return <svg viewBox="0 0 64 64" className="swatch"><circle cx="32" cy="32" r="18" fill="none" stroke="var(--coral)" strokeWidth="3" /><circle cx="32" cy="32" r="8" fill="var(--coral)" /></svg>
    case 'akiec':
      return <svg viewBox="0 0 64 64" className="swatch">{[...Array(5)].map((_, i) => <rect key={i} x={8 + i * 10} y={20 + (i % 2) * 8} width="7" height="22" fill="var(--amber)" opacity="0.8" />)}</svg>
    case 'vasc':
      return <svg viewBox="0 0 64 64" className="swatch"><path d="M12 40 Q 24 12, 32 32 T 52 24" stroke="var(--coral)" strokeWidth="4" fill="none" opacity="0.8" /></svg>
    case 'df':
      return <svg viewBox="0 0 64 64" className="swatch"><rect x="16" y="16" width="32" height="32" rx="16" fill="var(--ink)" opacity="0.75" /></svg>
    default:
      return null
  }
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
    } catch (err) {
      setError('Could not reach the analysis server. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const topCondition = result
    ? conditions.find((c) => c.id === result.predictions[0].condition)
    : null

  return (
    <div className="page">
      {/* HERO */}
      <header className="hero">
        <div className="hero-grid">
          <div className="hero-text">
            <p className="eyebrow eyebrow-light">Preliminary Screening Tool</p>
            <h1 className="hero-title">Dermato<span className="hero-title-accent">scan</span></h1>
            <p className="hero-sub">
              Upload a photo of a skin lesion and get an instant, explainable read on what it
              might be — trained on 10,015 clinically-labeled dermatoscopic images.
            </p>

            <div className="tool-compact">
              <label className="file-input">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                Choose Image
              </label>
              {previewUrl && <img src={previewUrl} alt="uploaded lesion" className="tool-preview-small" />}
              <button onClick={handleSubmit} disabled={!selectedFile || loading}>
                {loading ? 'Analyzing…' : 'Analyze Image'}
              </button>
              {error && <p className="error">{error}</p>}
            </div>
          </div>

          <div className="hero-image">
            <img src="/hero-bg.jpg" alt="Dermatologist examining a patient" />
          </div>
        </div>

        {(loading || result) && (
          <div className="result-panel">
            {loading && <p className="mono">PROCESSING…</p>}
            {result && (
              <>
                <div className="verdict">
                  <span className="mono verdict-label">MOST LIKELY MATCH</span>
                  <h3 className="verdict-name">{topCondition ? topCondition.name : result.predictions[0].condition}</h3>
                  <span className={`risk-tag risk-${result.predictions[0].risk_level}`}>
                    {result.predictions[0].risk_level} risk — {result.predictions[0].confidence}% confidence
                  </span>
                  {topCondition && <p className="verdict-desc">{topCondition.description}</p>}
                </div>

                <div className="result-columns">
                  <div className="readout">
                    <span className="mono readout-label">FULL READOUT</span>
                    {result.predictions.map((pred, idx) => (
                      <div key={idx} className={`readout-row ${idx === 0 ? 'primary' : ''}`}>
                        <div className="readout-row-top">
                          <span className="readout-name">{pred.condition.toUpperCase()}</span>
                          <span className={`risk-tag risk-${pred.risk_level}`}>{pred.risk_level}</span>
                        </div>
                        <div className="bar-bg">
                          <div className="bar-fill" style={{ width: `${pred.confidence}%` }} />
                        </div>
                        <span className="mono readout-pct">{pred.confidence}%</span>
                      </div>
                    ))}
                  </div>

                  {result.gradcam_image && (
                    <div className="gradcam-block">
                      <span className="mono readout-label">ATTENTION MAP</span>
                      <img src={`data:image/png;base64,${result.gradcam_image}`} alt="model attention heatmap" />
                      <p className="caption">Warm areas show what the model weighed most heavily.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <p className="disclaimer">
          This tool offers a preliminary read only — it is not a diagnosis. Always have any
          lesion of concern examined by a dermatologist.
        </p>
      </header>

      {/* ABCDE */}
      <section className="section abcde-section">
        <p className="eyebrow">Self-Check Reference</p>
        <h2>The ABCDE Rule</h2>
        <p className="section-lede">A widely-used dermatology mnemonic for spotting a mole worth having examined.</p>
        <div className="abcde-grid">
          {abcde.map((item) => (
            <div className="abcde-card" key={item.letter}>
              <span className="abcde-letter">{item.letter}</span>
              <span className="abcde-label">{item.label}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONDITIONS */}
      <section className="section specimen-section">
        <p className="eyebrow">Reference Panel</p>
        <h2>Conditions This Model Screens For</h2>
        <p className="section-lede">Seven categories, drawn from the HAM10000 dermatoscopic dataset — spanning benign, pre-cancerous, and malignant lesions.</p>
        <div className="specimen-grid">
          {conditions.map((c) => (
            <div className="specimen-card" key={c.id}>
              <div className="specimen-top">
                <Swatch id={c.id} />
                <span className="mono specimen-code">{c.code}</span>
              </div>
              <h3>{c.name}</h3>
              <span className="specimen-common">{c.common}</span>
              <p>{c.description}</p>
              <span className={`risk-tag risk-${c.risk}`}>{c.risk} risk</span>
            </div>
          ))}
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="section method-section">
        <p className="eyebrow">Transparency</p>
        <h2>How This Model Was Built</h2>
        <div className="stat-row">
          <div className="stat"><span className="mono stat-num">10,015</span><span className="stat-label">training images</span></div>
          <div className="stat"><span className="mono stat-num">84%</span><span className="stat-label">overall test accuracy</span></div>
          <div className="stat"><span className="mono stat-num">91%</span><span className="stat-label">recall on carcinoma cases</span></div>
          <div className="stat"><span className="mono stat-num">7</span><span className="stat-label">condition classes</span></div>
        </div>
        <p className="method-note">
          Built on a fine-tuned EfficientNet-B0, trained with class-weighted loss to counter the
          natural imbalance in dermatology data. The model is deliberately calibrated to err
          toward caution: it is more likely to flag a benign lesion for a second look than to
          wave off a dangerous one.
        </p>
      </section>

      <footer className="footer">
        <p>Dermatoscan is a student screening prototype. It does not replace professional medical evaluation.</p>
      </footer>
    </div>
  )
}

export default App