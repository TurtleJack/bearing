import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Band from '@ui/components/Band.jsx'
import Bathymetric from '../components/Bathymetric.jsx'
import Button from '@ui/components/Button.jsx'
import Eyebrow from '@ui/components/Eyebrow.jsx'
import FlowFrame from '../components/FlowFrame.jsx'
import SignalLoader from '@ui/components/SignalLoader.jsx'
import Wordmark from '@ui/components/Wordmark.jsx'
import { clearRid, getRid, setRepoSignals, start } from '../lib/engine.js'
import { demoRepoSignals, fetchRepoSignals, parseRepoUrl } from '../lib/github.js'

const PATH = [
  { index: '01', title: 'Point', detail: 'Point Bearing at a public GitHub repo — or run the bundled demo repo, no network needed.' },
  { index: '02', title: 'Answer', detail: 'Sixteen plain-language questions about who pays, what changes hands, and where your agents get their context.' },
  { index: '03', title: 'See', detail: 'A business-model verdict with its reasoning attached, plus a ranked gap report — rank and reason, never a score.' },
  { index: '04', title: 'Ship', detail: 'Export a business-brain/ folder your agents can read. Drop it in the repo; every session starts warm.' },
]

const OUTCOMES = [
  { label: 'Verdict', title: 'A business model, called honestly', detail: 'The structure your answers actually describe — or “not enough signal yet,” said plainly, never a default.' },
  { label: 'Gaps', title: 'What is missing, ranked', detail: 'The top three decisions you have not made yet, each with the reason it matters — no scores, no grades.' },
  { label: 'Export', title: 'A brain your agents load', detail: 'Plain markdown in your repo. Claude Code, Cursor, Codex — they all read files. Files are the interface.' },
]

export default function Start() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [state, setState] = useState('idle')
  const [note, setNote] = useState('')
  const resumable = Boolean(getRid())

  async function begin(event, useDemo = false) {
    event?.preventDefault()
    if (state === 'busy') return
    if (!useDemo && repoUrl.trim() && !parseRepoUrl(repoUrl)) {
      setState('error')
      setNote('That does not look like a GitHub repo — try owner/name or the full URL. Or run the demo repo.')
      return
    }
    setState('busy')
    setNote('')
    await start(name.trim(), email.trim(), useDemo ? 'demo' : repoUrl.trim())
    if (useDemo) {
      setRepoSignals(demoRepoSignals())
    } else if (repoUrl.trim()) {
      try {
        setRepoSignals(await fetchRepoSignals(repoUrl))
      } catch {
        // Live fetch failed (offline venue, rate limit) — degrade to the
        // fixture and mark it, so every downstream surface says so.
        setRepoSignals({ ...demoRepoSignals(), source: 'fixture-fallback' })
      }
    } else {
      setRepoSignals(null)
    }
    navigate('/intake')
  }

  const startOver = () => {
    clearRid()
    window.location.reload()
  }

  return (
    <FlowFrame>
      <Band surface="dark" seam className="fos-entry-hero">
        <Bathymetric style={{ top: 0, right: 0, width: 560, height: '100%', opacity: 0.48 }} />

        <div className="shell fos-entry-hero__inner">
          <div className="fos-entry-hero__top">
            <div>
              <Wordmark size={21} />
              <span>STARTING POINT PATH</span>
            </div>
            <a href="/">About Bearing</a>
          </div>

          <div className="fos-entry-hero__grid">
            <div className="fos-entry-hero__copy">
              <Eyebrow tone="signal">Open source · runs entirely on this device</Eyebrow>
              <h1>See what your project is missing to become a business.</h1>
              <p>
                Your agents know every line of your code. Bearing maps the other
                half — who pays, what the model is, what is still undecided —
                and ships it back into your repo where those agents can read it.
              </p>
              <div className="fos-entry-hero__meta">
                <span>ABOUT 8 MINUTES</span>
                <span>NO ACCOUNT · NO SERVER</span>
                <span>YOUR JUDGMENT REQUIRED</span>
              </div>
              <small>
                Sign-in here is a local profile in your browser — nothing leaves
                this device. In a production deployment, a real auth provider
                slots in at exactly this step.
              </small>
            </div>

            <div className="fos-entry-path" aria-label="Bearing path">
              <div className="fos-entry-path__head">
                <span>THE PATH</span>
                <i>REPO IN → BRAIN OUT</i>
              </div>
              <ol>
                {PATH.map((step) => (
                  <li key={step.index}>
                    <span>{step.index}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.detail}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Band>

      <Band surface="light" seam className="fos-entry-access">
        <div className="shell fos-entry-access__inner">
          <div className="fos-entry-access__copy">
            <Eyebrow>Your starting point</Eyebrow>
            <h2>Point it at what you already built.</h2>
            <p>
              A public GitHub repo gives Bearing real signals — agent config
              files, AI dependencies, license posture. No repo handy? The demo
              repo is a bundled fixture and says so on every screen.
            </p>

            <dl>
              <div>
                <dt>What is saved</dt>
                <dd>Your answers and the generated report — in this browser&apos;s localStorage, nowhere else.</dd>
              </div>
              <div>
                <dt>What is fetched</dt>
                <dd>Four public, unauthenticated GitHub API reads. No token, no scopes, no write access.</dd>
              </div>
              <div>
                <dt>What this is not</dt>
                <dd>A signup, a forecast guarantee, or an investor-readiness certificate.</dd>
              </div>
            </dl>
          </div>

          {resumable ? (
            <section className="fos-entry-card fos-entry-card--resume">
              <span>SESSION FOUND ON THIS DEVICE</span>
              <h3>Continue where you left off.</h3>
              <p>
                Your session is still in this browser. Resume the intake, or
                clear it and point Bearing at a different project.
              </p>
              <div className="fos-entry-card__actions">
                <Button to="/intake" size="lg">Resume</Button>
                <Button variant="secondary" onClick={startOver}>
                  Start over
                </Button>
              </div>
            </section>
          ) : (
            <form className="fos-entry-card" onSubmit={begin}>
              <header>
                <span>LOCAL PROFILE · NO ACCOUNT</span>
                <h3>Open your session.</h3>
                <p>Everything below is optional except the direction you point it.</p>
              </header>

              <label className="fos-entry-field fos-entry-field--code">
                <span>Public GitHub repo · optional</span>
                <input
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  placeholder="github.com/you/your-project"
                  autoCapitalize="none"
                  spellCheck="false"
                  autoFocus
                />
              </label>

              <div className="fos-entry-field-grid">
                <label className="fos-entry-field">
                  <span>Name · optional</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label className="fos-entry-field">
                  <span>Email · optional, stays local</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
              </div>

              <Button type="submit" size="lg" disabled={state === 'busy'}>
                {state === 'busy' ? (
                  <>
                    <SignalLoader variant="button" surface="onbrand" label="Opening session" />
                    Reading your repo…
                  </>
                ) : (
                  'Map my starting point'
                )}
              </Button>
              <Button variant="secondary" onClick={(e) => begin(e, true)} disabled={state === 'busy'}>
                Use the demo repo instead
              </Button>

              {state === 'error' && (
                <p className="fos-entry-card__error" role="alert" aria-live="polite">
                  {note}
                </p>
              )}

              <small>
                Skip the repo and Bearing still works — the repo just makes the
                gap report sharper.
              </small>
            </form>
          )}
        </div>
      </Band>

      <Band surface="dark" seam className="fos-entry-outcomes">
        <div className="shell">
          <div className="fos-entry-outcomes__intro">
            <Eyebrow tone="signal">What you walk away with</Eyebrow>
            <h2>A starting point you can inspect, challenge, and ship.</h2>
            <p>
              Bearing shows its reasoning so the report is the beginning of a
              better decision — not a score you are expected to trust.
            </p>
          </div>

          <div className="fos-entry-outcomes__grid">
            {OUTCOMES.map((outcome, index) => (
              <article key={outcome.label}>
                <span>{String(index + 1).padStart(2, '0')} · {outcome.label}</span>
                <h3>{outcome.title}</h3>
                <p>{outcome.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </Band>
    </FlowFrame>
  )
}
