/**
 * Dev-readiness rules — the JS mirror of rules/dev-readiness.md.
 * v0: detectors are hand-written against the markdown; parsing the markdown
 * directly is the roadmap. Statuses: satisfied | partial | absent | unimplemented.
 * Rules with stage "opinion" are suggestions — never counted as gaps.
 */

const short = (s, n = 90) => {
  const t = String(s ?? '').trim()
  return t.length > n ? `${t.slice(0, n)}…` : t
}

const TRIGGER_MODEL = {
  'a subscription': ['saas_subscription'],
  'metered by usage': ['usage_based'],
  'per transaction or event': ['transactional', 'marketplace'],
  'paying for my time': ['services'],
}

export const RULES = [
  {
    id: 'DEV-01',
    name: 'A buyer is named',
    stage: 'foundation',
    rationale: 'Agents optimize for whoever you describe. Describe no one and they optimize for everyone.',
    detect: (a) =>
      String(a.b3 ?? '').trim()
        ? { status: 'satisfied', reason: `You named who pays: “${short(a.b3)}”.` }
        : { status: 'absent', reason: '“Who exactly pays” came back blank — no buyer is on the record.' },
  },
  {
    id: 'DEV-02',
    name: 'A pricing model is chosen',
    stage: 'foundation',
    rationale: 'A price is a decision, not a discovery. Undecided pricing leaks into every roadmap conversation.',
    detect: (a) => {
      const trigger = String(a.b1 ?? '').trim()
      const price = Number(a.b4)
      if (trigger && price > 0)
        return { status: 'satisfied', reason: `“${trigger}” at roughly $${price} — trigger and price both on record.` }
      if (trigger)
        return { status: 'partial', reason: `A payment trigger is chosen (“${trigger}”) but no price is attached to it.` }
      return { status: 'absent', reason: 'No payment trigger or price is recorded.' }
    },
  },
  {
    id: 'DEV-03',
    name: 'Willingness-to-pay evidence exists',
    stage: 'foundation',
    rationale: 'One real signal that someone will pay outranks any amount of roadmap.',
    detect: (a) => {
      if (a.u1 === 'people pay for it')
        return { status: 'satisfied', reason: 'People already pay — the strongest evidence there is.' }
      if (String(a.u3 ?? '').trim())
        return { status: 'partial', reason: `Evidence recorded — “${short(a.u3)}” — but no one pays yet.` }
      return { status: 'absent', reason: 'No evidence that anyone wants this is on the record.' }
    },
  },
  {
    id: 'DEV-04',
    name: 'Revenue trigger matches the structure',
    stage: 'model',
    rationale: 'Charging like a SaaS while operating like a marketplace is a quiet, expensive contradiction.',
    detect: (a, repo, verdict) => {
      if (!verdict?.model)
        return { status: 'unimplemented', reason: 'No verdict yet to check the trigger against.' }
      const expected = TRIGGER_MODEL[a.b1] ?? []
      if (expected.includes(verdict.model))
        return { status: 'satisfied', reason: `Your payment trigger (“${a.b1}”) agrees with the ${verdict.label} verdict.` }
      return {
        status: 'partial',
        reason: `Your payment trigger (“${a.b1 ?? 'unanswered'}”) points away from the ${verdict.label} structure your other answers describe — worth a deliberate decision.`,
      }
    },
  },
  {
    id: 'DEV-05',
    name: 'A moat is stated',
    stage: 'model',
    rationale: 'Investors ask “why you” second. Agents never ask it at all unless it is written down.',
    detect: (a) => {
      if (a.b6 === 'honestly, nothing yet')
        return { status: 'absent', reason: 'You said it plainly: nothing is hard to copy yet. Honest — and now it is a named problem instead of a vague one.' }
      if (String(a.b6 ?? '').trim())
        return { status: 'satisfied', reason: `Moat on record: “${a.b6}”.` }
      return { status: 'absent', reason: 'No answer recorded for what is hard to copy.' }
    },
  },
  {
    id: 'DEV-06',
    name: 'Your agents have a context home',
    stage: 'agents',
    rationale: 'Context that lives in your head gets re-typed into every session, imperfectly.',
    detect: (a, repo) => {
      const files = repo?.agentFiles ?? []
      if (a.a2 === 'CLAUDE.md or AGENTS.md exists' || files.length)
        return { status: 'satisfied', reason: files.length ? `Agent context files found in the repo: ${files.join(', ')}.` : 'You keep a CLAUDE.md / AGENTS.md.' }
      if (a.a2 === 'a docs folder' || a.a2 === 'scattered across prompts and rules files')
        return { status: 'partial', reason: `Context exists but is ${a.a2 === 'a docs folder' ? 'in docs no agent reads by default' : 'scattered across prompts and rules files'}.` }
      return { status: 'absent', reason: 'You re-explain the project to every agent, every session.' }
    },
  },
  {
    id: 'DEV-07',
    name: 'Business context reaches your agents',
    stage: 'agents',
    rationale: 'Agents with code context and no business context build confidently in an unchecked direction.',
    detect: (a, repo) => {
      const files = repo?.agentFiles ?? []
      const hasAgentContext = files.length || a.a2 === 'CLAUDE.md or AGENTS.md exists'
      if (repo?.hasBusinessBrain)
        return { status: 'satisfied', reason: 'A business-brain/ folder exists in the repo — your agents can load it.' }
      if (hasAgentContext)
        return {
          status: 'absent',
          reason: `Your agents load code context${files.length ? ` (${files.join(', ')})` : ''} — none of it says who pays, what the moat is, or why this exists.`,
        }
      return { status: 'absent', reason: 'No agent-readable file anywhere carries the business: who pays, what the price is, why this exists.' }
    },
  },
  {
    id: 'DEV-08',
    name: 'A unit-economics sketch exists',
    stage: 'numbers',
    rationale: 'Three rough numbers beat zero precise ones. Investors read the sketch, not the spreadsheet.',
    detect: (a) => {
      const have = [Number(a.u2) > 0, Number(a.b4) > 0, Number(a.b5) > 0].filter(Boolean).length
      if (have === 3) return { status: 'satisfied', reason: 'Volume, price, and growth are all on record — enough for a first scenario.' }
      if (have > 0) return { status: 'partial', reason: `${have} of 3 numbers recorded (volume, price, growth) — the scenario chart is running on blanks.` }
      return { status: 'absent', reason: 'No volume, price, or growth numbers are recorded.' }
    },
  },
  {
    id: 'DEV-09',
    name: 'Usage is measured',
    stage: 'numbers',
    rationale: 'A usage-based model without metering is a subscription with extra steps.',
    detect: (a, repo, verdict) =>
      verdict?.model === 'usage_based'
        ? { status: 'unimplemented', reason: 'Your verdict is usage-based, but v0 has no metering detector — check this one yourself.' }
        : { status: 'unimplemented', reason: 'Only checked for usage-based models.' },
  },
  {
    id: 'DEV-10',
    name: 'A two-sided liquidity plan exists',
    stage: 'model',
    rationale: 'A marketplace without a cold-start plan is a landing page with two audiences.',
    detect: (a, repo, verdict) =>
      verdict?.model === 'marketplace'
        ? { status: 'unimplemented', reason: 'Your verdict is marketplace, but v0 has no liquidity detector — check this one yourself.' }
        : { status: 'unimplemented', reason: 'Only checked for marketplace models.' },
  },
  {
    id: 'DEV-11',
    name: 'License posture is recorded',
    stage: 'foundation',
    rationale: 'Undefined rights block both adoption and diligence. A LICENSE file is a business decision.',
    detect: (a, repo) => {
      if (!repo) return { status: 'unimplemented', reason: 'No repo connected — nothing to check.' }
      return repo.hasLicense
        ? { status: 'satisfied', reason: `${repo.name} ships a LICENSE file.` }
        : { status: 'absent', reason: `${repo.name} has no LICENSE file — rights are undefined for anyone who finds it.` }
    },
  },
  {
    id: 'DEV-12',
    name: 'A growth assumption is named',
    stage: 'opinion',
    rationale: 'Opinion-staged: any named number beats an implied one, but the “right” growth rate is a judgment call — so this is a suggestion, never a gap.',
    detect: (a) =>
      Number(a.b5) > 0
        ? { status: 'satisfied', reason: `You named ${a.b5}% monthly — now it can be argued with.` }
        : { status: 'partial', reason: 'Suggestion: name a growth number, even a guess — an unnamed assumption cannot be tested.' },
  },
]

// Fixed priority for ranking ties within a status. DEV-07 leads: it is the
// gap this product exists to close, and it is checkable on day one.
const PRIORITY = ['DEV-07', 'DEV-01', 'DEV-03', 'DEV-02', 'DEV-05', 'DEV-11', 'DEV-08', 'DEV-06', 'DEV-04']

export function evaluateRules(answers, repo, verdict) {
  const results = RULES.map((r) => {
    const { status, reason } = r.detect(answers ?? {}, repo, verdict)
    return { id: r.id, name: r.name, stage: r.stage, rationale: r.rationale, status, reason }
  })

  const rank = (id) => {
    const i = PRIORITY.indexOf(id)
    return i === -1 ? PRIORITY.length : i
  }
  const gaps = results
    .filter((r) => r.stage !== 'opinion' && (r.status === 'absent' || r.status === 'partial'))
    .sort((x, y) =>
      x.status !== y.status ? (x.status === 'absent' ? -1 : 1) : rank(x.id) - rank(y.id),
    )

  return {
    results,
    gaps: gaps.slice(0, 3),
    gapsTotal: gaps.length,
    notChecked: results.filter((r) => r.status === 'unimplemented'),
    suggestions: results.filter((r) => r.stage === 'opinion' && r.status !== 'satisfied'),
  }
}
