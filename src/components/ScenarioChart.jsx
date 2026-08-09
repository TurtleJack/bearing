import Eyebrow from '@ui/components/Eyebrow.jsx'

/**
 * Scenario chart — always three scenarios.
 * Base = hero line (3.4 stroke, action color, one endpoint dot).
 * Conservative = thin faint line. Optimistic = dashed green (signal).
 * Gridlines are hairlines; axis labels are mono. Colors resolve from
 * the enclosing Band's tokens.
 *
 *  - series: { conservative: number[], base: number[], optimistic: number[] }
 *  - xLabels: [{ at: 0..1, label }] axis marks
 *  - dotOn: which series carries the endpoint dot (default 'base')
 */
const W = 640
const H = 200
const PAD_X = 20
const TOP = 20
const BOTTOM = 180

function toPoints(values, max) {
  const n = values.length
  return values
    .map((v, i) => {
      const x = PAD_X + (i / (n - 1)) * (W - 2 * PAD_X)
      const y = BOTTOM - (v / max) * (BOTTOM - TOP)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default function ScenarioChart({
  title,
  legend = { conservative: 'Conservative', base: 'Base', optimistic: 'Optimistic' },
  series,
  xLabels = [
    { at: 0, label: 'M1' },
    { at: 1, label: 'M12' },
  ],
  dotOn = 'base',
  className = '',
}) {
  const max = Math.max(...series.optimistic, ...series.base, ...series.conservative)
  const dotSeries = series[dotOn]
  const n = dotSeries.length
  const dotX = PAD_X + (W - 2 * PAD_X)
  const dotY = BOTTOM - (dotSeries[n - 1] / max) * (BOTTOM - TOP)
  const dotColor = { base: 'var(--action)', optimistic: 'var(--signal)', conservative: 'var(--chart-faint)' }[dotOn]

  return (
    <div className={`scenario-chart ${className}`}>
      <div className="scenario-chart__head">
        {title && <Eyebrow>{title}</Eyebrow>}
        <div className="scenario-chart__legend">
          <span className="scenario-chart__key">
            <span className="scenario-chart__swatch" style={{ background: 'var(--chart-faint)' }} />
            {legend.conservative}
          </span>
          <span className="scenario-chart__key scenario-chart__key--base">
            <span className="scenario-chart__swatch" style={{ background: 'var(--action)', height: 3 }} />
            {legend.base}
          </span>
          <span className="scenario-chart__key">
            <span className="scenario-chart__swatch" style={{ background: 'var(--signal)' }} />
            {legend.optimistic}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 16}`} role="img" aria-label={title}>
        {[TOP, (TOP + BOTTOM) / 2, TOP + (BOTTOM - TOP) * 0.75].map((y) => (
          <line key={y} x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} stroke="var(--hairline)" strokeOpacity="0.6" />
        ))}
        <line x1={PAD_X} y1={BOTTOM} x2={W - PAD_X} y2={BOTTOM} stroke="var(--hairline)" />
        <polyline fill="none" stroke="var(--chart-faint)" strokeWidth="2" points={toPoints(series.conservative, max)} />
        <polyline fill="none" stroke="var(--signal)" strokeWidth="2" strokeDasharray="6 5" points={toPoints(series.optimistic, max)} />
        <polyline fill="none" stroke="var(--action)" strokeWidth="3.4" points={toPoints(series.base, max)} />
        <circle cx={dotX} cy={dotY} r="4.5" fill={dotColor} />
        {xLabels.map(({ at, label }) => (
          <text
            key={label}
            x={PAD_X + at * (W - 2 * PAD_X)}
            y={H + 12}
            textAnchor={at === 0 ? 'start' : at === 1 ? 'end' : 'middle'}
            fontFamily="Spline Sans Mono, monospace"
            fontSize="10"
            fill="var(--faint)"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}
