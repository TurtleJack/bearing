/**
 * Build the starting-point graph from the founder's own answers + repo
 * signals + ranked gaps. Solid edges = connections actually on the record.
 * Dashed holes = the top-ranked gaps, drawn as missing structure — the gap
 * report as a picture. Nothing here is stock data.
 */

const GAP_NODE_LABELS = {
  'DEV-01': 'who pays?',
  'DEV-02': 'pricing',
  'DEV-03': 'evidence',
  'DEV-04': 'trigger fit',
  'DEV-05': 'moat',
  'DEV-06': 'agent context',
  'DEV-07': 'business-brain/',
  'DEV-08': 'unit economics',
  'DEV-11': 'LICENSE',
}

const short = (s, n = 18) => {
  const t = String(s ?? '').trim()
  return t.length > n ? `${t.slice(0, n)}…` : t
}

export function buildConnectome(answers = {}, repo = null, report = null) {
  const nodes = []
  const edges = []
  const holes = []
  const add = (id, label, degree = 2, highlight = false) => {
    if (!nodes.some((n) => n.id === id)) nodes.push({ id, label, degree, highlight })
  }
  const link = (a, b) => edges.push({ a, b })

  const projectLabel = repo?.name ?? short(answers.p1, 16) ?? 'your project'
  add('project', projectLabel, 8, false)

  if (repo?.language) {
    add('lang', repo.language, 2)
    link('project', 'lang')
  }
  for (const f of (repo?.agentFiles ?? []).slice(0, 3)) {
    add(`agent-${f}`, f, 3)
    link('project', `agent-${f}`)
  }
  for (const d of (repo?.aiDeps ?? []).slice(0, 3)) {
    add(`dep-${d}`, short(d), 2)
    link('project', `dep-${d}`)
  }
  const agentTools = String(answers.a3 ?? '')
    .split(/[,;/]| and /)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3)
  for (const t of agentTools) {
    add(`tool-${t}`, short(t), 2)
    link('project', `tool-${t}`)
  }

  const v = report?.verdict
  if (v?.model) {
    add('model', v.label, 5)
    link('project', 'model')
    if (answers.b1) {
      add('trigger', short(answers.b1, 16), 3)
      link('model', 'trigger')
    }
  }
  if (String(answers.b3 ?? '').trim()) {
    add('buyer', short(answers.b3, 16), 4)
    link(v?.model ? 'model' : 'project', 'buyer')
  }
  if (String(answers.u3 ?? '').trim()) {
    add('evidence', 'evidence', 3)
    link(nodes.some((n) => n.id === 'buyer') ? 'buyer' : 'project', 'evidence')
  }
  if (answers.b6 && answers.b6 !== 'honestly, nothing yet') {
    add('moat', short(answers.b6, 16), 3)
    link('project', 'moat')
  }

  // The gaps, drawn: one dashed hole per top-ranked gap, anchored on the
  // project node. Gap #1 is featured (it pulses).
  const gaps = report?.rules?.gaps ?? []
  gaps.forEach((gap, i) => {
    const id = `gap-${gap.id}`
    add(id, GAP_NODE_LABELS[gap.id] ?? gap.name.toLowerCase(), 4, i === 0)
    holes.push({ a: 'project', b: id, featured: i === 0 })
  })

  return { nodes, edges, holes }
}
