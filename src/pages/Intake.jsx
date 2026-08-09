import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Band from '@ui/components/Band.jsx'
import Button from '@ui/components/Button.jsx'
import Eyebrow from '@ui/components/Eyebrow.jsx'
import FlowFrame from '../components/FlowFrame.jsx'
import SignalGenerating from '../components/SignalGenerating.jsx'
import SignalLoader from '@ui/components/SignalLoader.jsx'
import { complete, getAnswers, getInstrument, getRid, saveAnswers } from '../lib/engine.js'

/**
 * Intake — the founder's pace. Dark context rail (progress, autosave) beside
 * the light work area: real instrument, debounced autosave to localStorage,
 * real block progress, complete → verdict. Without a session there is nothing
 * to show — visitors route back to the start gate.
 */
const BLOCK_LABELS = {
  built: 'Built · what you made',
  agents: 'Agents · your AI stack',
  users: 'Users · evidence',
  business: 'Money · model & moat',
}

export default function Intake() {
  const rid = getRid()
  return rid ? <LiveIntake rid={rid} /> : <Navigate to="/start" replace />
}

function LiveIntake({ rid }) {
  const navigate = useNavigate()
  const [instrument, setInstrument] = useState(null)
  const [answers, setAnswers] = useState({})
  const [blockIdx, setBlockIdx] = useState(0)
  const [pace, setPace] = useState('block')
  const [qIdx, setQIdx] = useState(0) // one-at-a-time cursor within block
  const [savedAgo, setSavedAgo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loadProblem, setLoadProblem] = useState('')
  const [footProblem, setFootProblem] = useState('')
  const [missing, setMissing] = useState([])
  const [badFields, setBadFields] = useState({})
  const [helpOpen, setHelpOpen] = useState({})
  const [alreadyDone, setAlreadyDone] = useState(false)
  const pending = useRef({})
  const timer = useRef(null)

  useEffect(() => {
    Promise.all([getInstrument(), getAnswers(rid)])
      .then(([inst, saved]) => {
        setInstrument(inst)
        setAnswers(saved.answers)
        setAlreadyDone(saved.completed) // editing regenerates — never a locked door
      })
      .catch(() => setLoadProblem('Could not load your report session — try a reload.'))
  }, [rid, navigate])

  const flush = useCallback(() => {
    const batch = pending.current
    pending.current = {}
    if (!Object.keys(batch).length) return
    saveAnswers(rid, batch)
      .then(() => setSavedAgo(0))
      .catch(() => {
        pending.current = { ...batch, ...pending.current } // retry on next change
      })
  }, [rid])

  useEffect(() => {
    const t = setInterval(
      () => setSavedAgo((s) => (s === null ? null : Math.min(s + 1, 99))),
      1000
    )
    return () => clearInterval(t)
  }, [])

  function setAnswer(qid, value) {
    setAnswers((a) => ({ ...a, [qid]: value }))
    setMissing((m) => m.filter((id) => id !== qid))
    setFootProblem('')
    pending.current[qid] = value
    clearTimeout(timer.current)
    timer.current = setTimeout(flush, 700)
  }

  const blocks = useMemo(() => {
    if (!instrument) return []
    return instrument.blocks.map((name) => ({
      name,
      questions: instrument.questions.filter((q) => q.block === name),
    }))
  }, [instrument])

  if (loadProblem) return <IntakeShell note={loadProblem} />
  if (!instrument) return <IntakeShell note="Loading your questions…" loading />
  if (busy) {
    return (
      <FlowFrame>
        <SignalGenerating
          label={alreadyDone ? 'Updating your report' : 'Generating your report'}
          honesty={
            alreadyDone
              ? 'Still working — regenerating from your edits'
              : 'Still working — good models take a beat'
          }
        />
      </FlowFrame>
    )
  }

  const current = blocks[blockIdx]
  const answeredIn = (b) =>
    b.questions.filter((q) => ![undefined, null, ''].includes(answers[q.id])).length
  const totalAnswered = blocks.reduce((n, b) => n + answeredIn(b), 0)
  const totalQuestions = blocks.reduce((n, b) => n + b.questions.length, 0)
  const progress = Math.round((totalAnswered / totalQuestions) * 100)
  const lastBlock = blockIdx === blocks.length - 1
  const visible =
    pace === 'block' ? current.questions : current.questions.slice(qIdx, qIdx + 1)
  const qNumber = blocks.slice(0, blockIdx).reduce((n, b) => n + b.questions.length, 0)

  async function advance() {
    clearTimeout(timer.current)
    flush()
    if (pace === 'single' && qIdx < current.questions.length - 1) {
      setQIdx((i) => i + 1)
      return
    }
    if (!lastBlock) {
      setBlockIdx((i) => i + 1)
      setQIdx(0)
      return
    }
    setBusy(true)
    try {
      await new Promise((r) => setTimeout(r, 250)) // let the last flush land
      await complete(rid)
      navigate('/report')
    } catch (err) {
      setBusy(false)
      const gaps = err.body?.missing
      if (gaps) {
        setMissing(gaps)
        const firstBlock = blocks.findIndex((b) => b.questions.some((q) => gaps.includes(q.id)))
        if (firstBlock >= 0) {
          setBlockIdx(firstBlock)
          setQIdx(0)
        }
        setFootProblem(
          `Almost — ${gaps.length} required answer${gaps.length > 1 ? 's' : ''} still blank. They're marked below in red.`
        )
      } else {
        setFootProblem('Could not generate the report — your answers are saved; try again.')
      }
    }
  }

  return (
    <FlowFrame>
      <Band surface="light" grain={false} as="div" style={{ background: 'var(--surface)' }}>
        <div className="shell intake-top">
          <span className="h3">Your starting point</span>
          {alreadyDone && (
            <span className="mono mono-chip mono-chip--outline">
              REPORT EXISTS — EDITS REGENERATE IT · <a href="/report" style={{ color: 'inherit' }}>VIEW</a>
            </span>
          )}
          <div className="pace-toggle">
            <Eyebrow>Pace</Eyebrow>
            <div className="pace-toggle__group" role="tablist" aria-label="Pace">
              {[
                ['block', 'By block'],
                ['single', 'One at a time'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={pace === key}
                  className={`pace-toggle__opt ${pace === key ? 'pace-toggle__opt--on' : ''}`}
                  onClick={() => {
                    setPace(key)
                    setQIdx(0)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Band>

      <div className="shell intake-shell">
      <div className="intake-split intake-split--card">
        {/* ① Dark: context rail — real progress */}
        <Band surface="dark" as="aside" className="intake-rail" aria-label="Progress">
          <Eyebrow>Progress</Eyebrow>
          {blocks.map((b, i) => {
            const done = answeredIn(b)
            const state = i === blockIdx ? 'now' : done === b.questions.length ? 'done' : 'todo'
            return (
              <button
                key={b.name}
                className={`intake-rail__item ${state === 'todo' ? 'intake-rail__item--todo' : ''}`}
                style={{
                  ...(state === 'done' ? { color: 'var(--signal)' } : null),
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                }}
                onClick={() => {
                  setBlockIdx(i)
                  setQIdx(0)
                }}
              >
                <span
                  className="intake-rail__dot"
                  style={
                    state === 'done'
                      ? { background: 'var(--signal)' }
                      : state === 'now'
                        ? { background: 'var(--action-tint)' }
                        : undefined
                  }
                />
                {BLOCK_LABELS[b.name].split(' ')[0]} {done}/{b.questions.length}
              </button>
            )
          })}
          <div className="intake-rail__track">
            <div className="intake-rail__fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
            {savedAgo === null ? 'autosave armed' : `saved ${savedAgo}s ago`}
          </span>
        </Band>

        {/* ② Light: the question(s) you're on */}
        <Band surface="light" as="div" className="intake-work">
          <Eyebrow>
            Block {blockIdx + 1} · {BLOCK_LABELS[current.name]}
          </Eyebrow>

          {visible.map((q, vi) => {
            const n = qNumber + (pace === 'single' ? qIdx : vi) + 1
            return (
              <div className="intake-q" key={q.id}>
                <div className={`intake-q__prompt ${missing.includes(q.id) ? 'intake-q__prompt--missing' : ''}`}>
                  {n} · {q.q}
                  {!q.required && (
                    <span className="mono" style={{ fontSize: 9, color: 'var(--faint)', marginLeft: 8 }}>
                      OPTIONAL
                    </span>
                  )}
                  {q.help && (
                    <button
                      type="button"
                      className={`intake-q__info ${helpOpen[q.id] ? 'intake-q__info--on' : ''}`}
                      aria-label={`Why we ask: ${q.q}`}
                      aria-expanded={Boolean(helpOpen[q.id])}
                      onClick={() => setHelpOpen((h) => ({ ...h, [q.id]: !h[q.id] }))}
                    >
                      i
                    </button>
                  )}
                  {missing.includes(q.id) && (
                    <span className="mono intake-q__needed">NEEDED</span>
                  )}
                </div>
                {helpOpen[q.id] && <div className="intake-q__help">{q.help}</div>}
                {q.kind === 'chips' ? (
                  <div className="chip-select" role="radiogroup" aria-label={q.q}>
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        role="radio"
                        aria-checked={answers[q.id] === opt}
                        className={`chip-select__chip ${answers[q.id] === opt ? 'chip-select__chip--on' : ''}`}
                        onClick={() => setAnswer(q.id, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : q.kind === 'number' ? (
                  <>
                    <input
                      type="number"
                      className="intake-open intake-open--number"
                      value={answers[q.id] ?? ''}
                      placeholder={q.example ?? ''}
                      onChange={(e) => {
                        const bad = e.target.validity.badInput
                        setBadFields((f) => ({ ...f, [q.id]: bad }))
                        if (!bad) setAnswer(q.id, e.target.value === '' ? '' : Number(e.target.value))
                      }}
                      onBlur={(e) =>
                        setBadFields((f) => ({ ...f, [q.id]: e.target.validity.badInput }))
                      }
                      aria-label={q.q}
                      aria-invalid={Boolean(badFields[q.id])}
                    />
                    {badFields[q.id] && (
                      <div className="intake-hint">
                        Numbers only here{q.example ? ` — like "${q.example.replace('e.g. ', '')}"` : ''}. For
                        ranges, give us the middle.
                      </div>
                    )}
                  </>
                ) : (
                  <textarea
                    className="intake-open"
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="In your own words — plain language is the point."
                    aria-label={q.q}
                  />
                )}
              </div>
            )
          })}

          {footProblem && <div className="entry-invite__error">{footProblem}</div>}

          <div className="intake-foot">
            <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
              {totalAnswered} / {totalQuestions} answered
            </span>
            <Button onClick={advance} disabled={busy}>
              {lastBlock && (pace === 'block' || qIdx === current.questions.length - 1)
                ? alreadyDone
                  ? 'Update my report →'
                  : 'Get my report →'
                : pace === 'single'
                  ? 'Next →'
                  : 'Next block →'}
            </Button>
          </div>
        </Band>
      </div>
      </div>
    </FlowFrame>
  )
}

function IntakeShell({ note, loading = false }) {
  return (
    <FlowFrame>
      <Band surface="light">
        <div
          className="shell band-pad"
          style={{
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          {loading ? (
            <SignalLoader
              variant="md"
              surface="light"
              phrase={note}
              showCaret
              label={note}
            />
          ) : (
            <p className="body-l">{note}</p>
          )}
        </div>
      </Band>
    </FlowFrame>
  )
}
