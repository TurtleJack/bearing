/**
 * Bounded force layout for the marketing connectome hero.
 * Same family as app ConnectomeMap (CTX-208) — no charting dependency.
 */

export function layoutForceGraph(payload, {
  width = 960,
  height = 560,
  ticks = 100,
} = {}) {
  const nodesIn = Array.isArray(payload?.nodes) ? payload.nodes : []
  if (!nodesIn.length) return { nodes: [], links: [], width, height }

  const degrees = nodesIn.map((n) => Number(n.degree) || 1)
  const maxDeg = Math.max(...degrees, 1)
  const nodes = nodesIn.map((n, i) => {
    const angle = (i / nodesIn.length) * Math.PI * 2
    const r = Math.min(width, height) * 0.34
    return {
      id: n.id,
      label: n.label || n.id,
      degree: Number(n.degree) || 1,
      highlight: Boolean(n.highlight),
      x: width / 2 + Math.cos(angle) * r,
      y: height / 2 + Math.sin(angle) * r,
      vx: 0,
      vy: 0,
      r: 5 + (Number(n.degree) / maxDeg) * 14,
    }
  })
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))

  const links = []
  for (const e of payload.edges || []) {
    if (byId[e.a] && byId[e.b]) {
      links.push({ a: e.a, b: e.b, kind: 'edge', strength: 0.045 })
    }
  }
  for (const h of payload.holes || []) {
    if (byId[h.a] && byId[h.b]) {
      links.push({
        a: h.a,
        b: h.b,
        kind: 'hole',
        strength: 0.012,
        featured: Boolean(h.featured),
      })
    }
  }

  const cx = width / 2
  const cy = height / 2
  // Small graphs need stronger repulsion and weaker gravity or they huddle
  // at the center — scale both so a 15-node starting-point map fills the stage.
  const repulsion = 1100 * Math.max(1, 110 / nodesIn.length)
  const gravity = nodesIn.length < 25 ? 0.0045 : 0.012
  for (let t = 0; t < ticks; t += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i]
        const b = nodes[j]
        let dx = a.x - b.x
        let dy = a.y - b.y
        const dist2 = dx * dx + dy * dy || 0.01
        const force = repulsion / dist2
        const dist = Math.sqrt(dist2)
        dx = (dx / dist) * force
        dy = (dy / dist) * force
        a.vx += dx
        a.vy += dy
        b.vx -= dx
        b.vy -= dy
      }
    }
    for (const link of links) {
      const a = byId[link.a]
      const b = byId[link.b]
      const dx = b.x - a.x
      const dy = b.y - a.y
      a.vx += dx * link.strength
      a.vy += dy * link.strength
      b.vx -= dx * link.strength
      b.vy -= dy * link.strength
    }
    for (const n of nodes) {
      n.vx += (cx - n.x) * gravity
      n.vy += (cy - n.y) * gravity
      n.vx *= 0.84
      n.vy *= 0.84
      n.x += n.vx
      n.y += n.vy
      n.x = Math.min(width - 18, Math.max(18, n.x))
      n.y = Math.min(height - 18, Math.max(18, n.y))
    }
  }

  return { nodes, links, width, height }
}
