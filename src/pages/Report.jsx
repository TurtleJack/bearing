import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Band from '@ui/components/Band.jsx'
import Bathymetric from '../components/Bathymetric.jsx'
import Button from '@ui/components/Button.jsx'
import ConnectomeHero from '../components/ConnectomeHero.jsx'
import Eyebrow from '@ui/components/Eyebrow.jsx'
import FlowFrame from '../components/FlowFrame.jsx'
import FounderQuote from '../components/FounderQuote.jsx'
import GapReport from '../components/GapReport.jsx'
import ReasoningUnderline from '../components/ReasoningUnderline.jsx'
import ScenarioChart from '../components/ScenarioChart.jsx'
import SignalGenerating from '../components/SignalGenerating.jsx'
import Wordmark from '@ui/components/Wordmark.jsx'
import { fmtMoney, getAnswers, getReport, getRid } from '../lib/engine.js'
import { buildConnectome } from '../lib/connectomeBuild.js'

/**
 * The report — the payoff. Dark verdict → dark map of your starting point →
 * light reasoning + gaps → dark chart + export CTA.
 */
const ALT_BLURBS = {
  marketplace: 'Fits if connecting two sides ever becomes the engine. Watch for supply you don’t own.',
  saas_subscription: 'Fits if the relationship turns ongoing and the product does the work monthly.',
  usage_based: 'Fits if payment should track consumption — natural when your costs are per-token or per-run.',
  transactional: 'Fits if people pay per event and return when the need returns.',
  services: 'Fits if you deliver the outcome yourself — watch utilization if you go here.',
}

const KEY_DRIVERS = {
  marketplace: 'take rate × liquidity',
  saas_subscription: 'retention × expansion',
  usage_based: 'usage growth × unit cost',
  transactional: 'repeat rate × CAC',
  services: 'utilization × scope',
}

const MODEL_NOUN = {
  marketplace: 'marketplace',
  saas_subscription: 'subscription',
  usage_based: 'usage-model',
  transactional: 'transactional',
  services: 'services',
}

export default function Report() {
  const rid = getRid()
  const [live, setLive] = useState(null)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!rid) return
    Promise.all([getReport(rid), getAnswers(rid)])
      .then(([report, saved]) => {
        setLive(report)
        setAnswers(saved.answers)
      })
      .catch(() => {}) // not completed yet → honest state below
      .finally(() => setChecked(true))
  }, [rid])

  if (!rid) return <Navigate to="/start" replace />
  if (!checked) {
    return (
      <FlowFrame>
        <SignalGenerating label="Loading your report" honesty="Still working — pulling your verdict" />
      </FlowFrame>
    )
  }
  if (!live) {
    return (
      <FlowFrame>
        <Band surface="light" className="report-notready">
          <div className="shell" style={{ padding: '4rem 0' }}>
            <h2>Your report isn&apos;t ready yet.</h2>
            <p style={{ opacity: 0.75, maxWidth: '32rem' }}>
              Finish the intake and your verdict generates from your answers —
              no samples, no placeholders.
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/intake">Back to your intake →</Link>
            </p>
          </div>
        </Band>
      </FlowFrame>
    )
  }
  // The engine refuses to elect a default on thin signal — honor that
  // honestly instead of rendering a verdict page around a null model.
  if (live.verdict?.insufficient) {
    return (
      <FlowFrame>
        <Band surface="light" className="report-notready">
          <div className="shell" style={{ padding: '4rem 0' }}>
            <h2>Not enough signal yet — and we won&apos;t guess.</h2>
            <p style={{ opacity: 0.75, maxWidth: '32rem' }}>
              Your answers didn&apos;t carry enough structural tells to call a
              business model honestly. A few more of the choice questions —
              who shows up, what triggers payment — and the verdict comes from
              your words, not a default.
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/intake">Revisit your answers →</Link>
            </p>
          </div>
        </Band>
      </FlowFrame>
    )
  }
  return <LiveReport report={live} answers={answers} />
}

function LiveReport({ report, answers }) {
  const v = report.verdict
  const confidenceCopy = {
    high: 'Your answers point clearly to one model. No tie-breakers needed.',
    medium: 'Your answers lean one way — a few tells point elsewhere. Worth a second look.',
    low: 'Your answers split across models — treat this as a starting hypothesis, not a verdict.',
  }[v.confidence]
  const topTells = [...v.trace].sort((a, b) => b.weight - a.weight).slice(0, 3)
  const scenarios = {
    conservative: report.scenarios.conservative.monthly,
    base: report.scenarios.base.monthly,
    optimistic: report.scenarios.optimistic.monthly,
  }
  const graph = useMemo(
    () => buildConnectome(answers, report.repo, report),
    [answers, report],
  )
  const repo = report.repo

  return (
    <FlowFrame>
      {/* ① Dark: the verdict lands */}
      <Band surface="dark" seam className="report-verdict">
        <div className="shell">
          <div className="report-nav">
            <div className="report-nav__lockup">
              <Wordmark size={20} />
              <span className="mono report-nav__parent">OPEN SOURCE · MIT</span>
            </div>
            <span className="mono mono-chip mono-chip--outline">
              rules {v.doctrine_version} · {v.doctrine.join(' · ')}
            </span>
          </div>
        </div>
        <Bathymetric style={{ top: 60, right: 0, width: 360, height: 'calc(100% - 60px)', opacity: 0.6 }} />
        <div className="shell">
          <div className="report-verdict__grid">
            <div style={{ flex: 1 }}>
              <Eyebrow tone="action">Starting Point Report</Eyebrow>
              <div style={{ fontSize: 13, color: 'var(--faint)', margin: '16px 0 8px' }}>
                {report.prepared_for && (
                  <>Prepared for <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{report.prepared_for}</b> — </>
                )}
                {report.company_line}
              </div>
              <h1 className="display" style={{ margin: '8px 0 0' }}>
                Your model is{' '}
                <ReasoningUnderline
                  strong
                  trace={
                    <>
                      {topTells.map((tell, i) => (
                        <span key={i}>
                          You said <b>&quot;{String(tell.answer)}&quot;</b> — a {MODEL_NOUN[tell.model] ?? tell.model} tell.{' '}
                        </span>
                      ))}
                      Weighed per {v.doctrine.join(', ')} at {v.doctrine_version}.
                    </>
                  }
                >
                  {v.label}
                </ReasoningUnderline>
              </h1>
              <div className="report-verdict__sub">{report.why.split('.')[0]}.</div>
            </div>
            <div className="conf-card">
              <Eyebrow>Confidence</Eyebrow>
              <div className="conf-card__level">
                <span
                  className="conf-card__dot"
                  style={
                    v.confidence === 'medium'
                      ? { background: 'var(--warning)', boxShadow: 'none' }
                      : v.confidence === 'low'
                        ? { background: 'var(--error)', boxShadow: 'none' }
                        : undefined
                  }
                />
                {v.confidence[0].toUpperCase() + v.confidence.slice(1)}
              </div>
              <div className="conf-card__body">{confidenceCopy}</div>
            </div>
          </div>
        </div>
      </Band>

      {/* ② Dark: your starting point, drawn */}
      <Band surface="dark" seam>
        <div className="shell band-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <Eyebrow>Your starting point, drawn</Eyebrow>
              <p style={{ maxWidth: '38rem', marginTop: 10, color: 'var(--ink-muted)' }}>
                Every node comes from your repo or your answers. Solid lines are
                connections on the record. Dashed lines are your top gaps —
                structure that doesn&apos;t exist yet.
              </p>
            </div>
            {repo && (
              <span className={`data-chip${repo.source === 'github' ? ' data-chip--live' : ''}`}>
                {repo.source === 'github'
                  ? `LIVE · ${repo.name}`
                  : repo.source === 'fixture-fallback'
                    ? 'FIXTURE DATA — LIVE FETCH UNAVAILABLE'
                    : 'DEMO REPO — BUNDLED FIXTURE'}
              </span>
            )}
          </div>
          <div className="connectome-band__stage">
            <ConnectomeHero graph={graph} />
          </div>
          <div className="connectome-band__legend">
            <span><i /> ON THE RECORD</span>
            <span><i className="is-hole" /> MISSING — A GAP</span>
          </div>
        </div>
      </Band>

      {/* ③ Light: the gaps, then room to read the why */}
      <Band surface="light">
        <div className="shell band-pad">
          <GapReport rules={report.rules} />

          <div className="report-why" style={{ marginTop: 48 }}>
            <div>
              <Eyebrow style={{ marginBottom: 16 }}>Why this model — for you</Eyebrow>
              {report.evidence_quote && (
                <FounderQuote source="your strongest evidence, your words" className="report-quote">
                  &quot;{report.evidence_quote}&quot;
                </FounderQuote>
              )}
              <p style={{ marginTop: 20, marginBottom: 0 }}>{report.why}</p>
            </div>
            <div>
              <Eyebrow style={{ marginBottom: 16 }}>Two alternatives worth a look</Eyebrow>
              {v.alternatives.map((alt) => (
                <div className="alt-card" key={alt.model}>
                  <div className="alt-card__head">
                    <span className="alt-card__name">{alt.label}</span>
                    <Eyebrow>Secondary</Eyebrow>
                  </div>
                  <p>{ALT_BLURBS[alt.model]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="report-assumptions">
            <Eyebrow>Five assumptions to validate before you commit</Eyebrow>
            <div className="assumption-grid">
              {report.assumptions.map((text, i) => (
                <div className="assumption" key={i}>
                  <span className="assumption__n">0{i + 1}</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Band>

      {/* ④ Dark: the chart + the export CTA draw the eye */}
      <Band surface="dark" seam>
        <div className="shell band-pad">
          <div className="scenario-chart__head" style={{ alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <Eyebrow>Year 1 revenue — three scenarios, from your three numbers</Eyebrow>
              <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>
                Key driver:{' '}
                <span style={{ color: 'var(--action-tint)' }}>{KEY_DRIVERS[v.model]}</span>
              </div>
            </div>
          </div>
          <div className="report-chart">
            <ScenarioChart series={scenarios} />
            <div className="report-chart__figures">
              <div>
                <Eyebrow>Conservative · M12 ARR</Eyebrow>
                <div className="figure tnum" style={{ fontSize: 24, color: 'var(--chart-faint)', marginTop: 3 }}>
                  {fmtMoney(report.scenarios.conservative.m12_arr)}
                </div>
              </div>
              <div>
                <Eyebrow tone="action">Base · M12 ARR</Eyebrow>
                <div className="figure tnum" style={{ fontSize: 32, color: 'var(--action-tint)', marginTop: 3 }}>
                  {fmtMoney(report.scenarios.base.m12_arr)}
                </div>
              </div>
              <div>
                <Eyebrow>Optimistic · M12 ARR</Eyebrow>
                <div className="figure tnum" style={{ fontSize: 24, color: 'var(--signal)', marginTop: 3 }}>
                  {fmtMoney(report.scenarios.optimistic.m12_arr)}
                </div>
              </div>
            </div>
          </div>

          <div className="upgrade-card">
            <div>
              <Eyebrow tone="action">The next step — free, it&apos;s files</Eyebrow>
              <div className="upgrade-card__title">Ship this brain into your repo.</div>
              <div className="upgrade-card__sub">
                A business-brain/ folder in plain markdown, plus the snippet
                that makes Claude Code, Cursor, and Codex load it — so every
                agent you run starts knowing who pays and why this exists.
              </div>
            </div>
            <div style={{ flex: 'none', textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--faint)', margin: '0 0 14px' }}>
                PLAIN MARKDOWN · NO API · NO LOCK-IN
              </div>
              <Button size="lg" to="/export">
                Export the brain →
              </Button>
            </div>
          </div>
          <div className="report-foot">
            Saved on this device ·{' '}
            <Link to="/intake" style={{ color: 'var(--ink-muted)' }}>
              Edit my answers → the report regenerates
            </Link>{' '}
            · Checked against {v.doctrine_version} — an open ruleset; PR yours in
          </div>
        </div>
      </Band>
    </FlowFrame>
  )
}
