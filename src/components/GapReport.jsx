import Eyebrow from '@ui/components/Eyebrow.jsx'

/**
 * GapReport — the first-run surface. Design rules, inherited deliberately:
 * ranked, never exhaustive (top 3); rank + reason, quoting the founder's own
 * answer; NO score, grade, percentage, or progress bar anywhere; honest empty
 * state that names what was not checked and why.
 */
export default function GapReport({ rules }) {
  if (!rules) return null
  const { gaps, gapsTotal, results, notChecked, suggestions } = rules

  return (
    <div className="report-gaps">
      <Eyebrow style={{ marginBottom: 4 }}>What&apos;s missing — ranked, never scored</Eyebrow>

      {gaps.length === 0 ? (
        <p style={{ maxWidth: '38rem' }}>
          No gaps found in the rules that ran. That is rarer than it sounds —
          and it is a statement about these {results.length} checks, not a
          certificate.
        </p>
      ) : (
        <div className="gap-report">
          {gaps.map((gap, i) => (
            <article key={gap.id} className={`gap-card${gap.status === 'partial' ? ' gap-card--partial' : ''}`}>
              <span className="gap-card__rank">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="gap-card__name">{gap.name}</div>
                <p className="gap-card__reason">{gap.reason}</p>
                <div className="gap-card__meta">
                  {gap.id} · {gap.status.toUpperCase()} · {gap.rationale}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="gap-report__foot" style={{ marginTop: 14 }}>
        {gapsTotal > gaps.length && (
          <>+{gapsTotal - gaps.length} more in the export. </>
        )}
        {notChecked.length > 0 && (
          <>Not checked: {notChecked.map((r) => r.id).join(', ')} — no detector applies yet, and we say so instead of guessing. </>
        )}
        {suggestions.length > 0 && (
          <>Suggestion (opinion-staged, never a gap): {suggestions[0].reason}</>
        )}
      </div>

      <details className="gap-report__all">
        <summary>All {results.length} rule statuses</summary>
        <div style={{ marginTop: 10 }}>
          {results.map((r) => (
            <div key={r.id} className="gap-status-row">
              <span className="mono mono-chip mono-chip--outline">{r.id}</span>
              <span className={`gap-status gap-status--${r.status}`}>{r.status}</span>
              <span>
                <b>{r.name}</b> — {r.reason}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
