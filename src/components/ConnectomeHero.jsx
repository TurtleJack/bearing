import { useEffect, useMemo, useRef, useState } from 'react'
import { layoutForceGraph } from '../lib/connectomeLayout.js'

/**
 * Connectome — force-laid SVG graph of the founder's own starting point.
 * Solid = a recorded connection; dashed = a structural hole (a gap).
 * The featured hole pulses. Data comes in as a prop — nothing is stock.
 */
export default function ConnectomeHero({ graph }) {
  const rootRef = useRef(null)
  const [size, setSize] = useState({ width: 1100, height: 640 })
  const [reducedMotion, setReducedMotion] = useState(false)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 40 && height > 40) {
        setSize({
          width: Math.round(width),
          height: Math.round(height),
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(
    () => layoutForceGraph(graph, {
      width: size.width,
      height: size.height,
      ticks: reducedMotion ? 40 : 110,
    }),
    [graph, size.width, size.height, reducedMotion],
  )

  const byId = useMemo(
    () => Object.fromEntries(layout.nodes.map((n) => [n.id, n])),
    [layout.nodes],
  )

  return (
    <div
      ref={rootRef}
      className={`plas-connectome${reducedMotion ? ' is-static' : ''}`}
      aria-hidden="true"
    >
      <svg
        className="plas-connectome__svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="plas-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--action-tint)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--action-tint)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {layout.links.map((link, i) => {
          const a = byId[link.a]
          const b = byId[link.b]
          if (!a || !b) return null
          const hole = link.kind === 'hole'
          return (
            <line
              key={`${link.kind}-${link.a}-${link.b}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={[
                hole ? 'plas-connectome__hole' : 'plas-connectome__edge',
                link.featured ? 'is-featured' : '',
              ].filter(Boolean).join(' ')}
            />
          )
        })}

        {layout.nodes.map((n) => (
          <g
            key={n.id}
            className={[
              'plas-connectome__node',
              n.highlight ? 'is-highlight' : '',
              hover === n.id ? 'is-hover' : '',
            ].filter(Boolean).join(' ')}
            transform={`translate(${n.x},${n.y})`}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
          >
            {n.highlight && (
              <circle className="plas-connectome__halo" r={n.r + 10} />
            )}
            <circle r={n.r} />
            <text y={n.r + 14}>{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="plas-connectome__grain" />
    </div>
  )
}
