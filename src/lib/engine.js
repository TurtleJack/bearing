import { evaluateRules } from './rules.js'

/**
 * The entire "backend". Same async API surface as the original hosted engine,
 * resolving from localStorage instead of a server — deterministic, offline,
 * inspectable. The classifier is a weighted-signal scorer: every point in the
 * verdict traces back to one of the founder's own answers.
 */

const RID_KEY = 'bearing-rid'
const PROFILE_KEY = 'bearing-profile'
const REPO_KEY = 'bearing-repo'
const key = (rid, what) => `bearing-${what}-${rid}`

const MODELS = ['marketplace', 'saas_subscription', 'usage_based', 'transactional', 'services']

export const MODEL_LABELS = {
  marketplace: 'Marketplace',
  saas_subscription: 'SaaS subscription',
  usage_based: 'Usage-based',
  transactional: 'Transactional',
  services: 'Productized services',
}

// Rule citations per verdict — the checks that lean on this classification.
const MODEL_RULES = {
  marketplace: ['DEV-04', 'DEV-10'],
  saas_subscription: ['DEV-02', 'DEV-04'],
  usage_based: ['DEV-04', 'DEV-09'],
  transactional: ['DEV-02', 'DEV-04'],
  services: ['DEV-02', 'DEV-04'],
}

export const INSTRUMENT = [
  // -- Block 1 · What you built (4)
  { id: 'p1', block: 'built', q: 'In one sentence: what did you build?', kind: 'text', required: true,
    help: 'Write it like you would say it to another engineer — plain language beats pitch language.' },
  { id: 'p2', block: 'built', q: 'Who has to show up for this to work?', kind: 'chips', required: true,
    options: ['just users', 'two sides who need each other', 'users + my own expert time'],
    signals: { 'two sides who need each other': [['marketplace', 3]], 'users + my own expert time': [['services', 2]] },
    help: 'This one answer separates marketplaces from everything else: who must show up?' },
  { id: 'p3', block: 'built', q: 'What does someone walk away with?', kind: 'chips', required: true,
    options: ['software they run', 'an outcome delivered for them', 'access to other people or resources'],
    signals: { 'software they run': [['saas_subscription', 2], ['usage_based', 1]],
      'an outcome delivered for them': [['services', 2], ['transactional', 1]],
      'access to other people or resources': [['marketplace', 2]] },
    help: 'Not what you build — what they walk away with.' },
  { id: 'p4', block: 'built', q: 'Is the relationship ongoing or per-event?', kind: 'chips', required: true,
    options: ['ongoing — they would miss it monthly', 'per event — back when the need returns'],
    signals: { 'ongoing — they would miss it monthly': [['saas_subscription', 2], ['usage_based', 1]],
      'per event — back when the need returns': [['transactional', 2], ['marketplace', 1]] },
    help: 'Ongoing = they would miss you monthly. Per-event = they return when the need returns.' },

  // -- Block 2 · Your agent stack (3) — no model signals; feeds gaps + export
  { id: 'a1', block: 'agents', q: 'How much of this codebase did agents write?', kind: 'chips', required: true,
    options: ['most of it', 'about half', 'some of it', 'none'],
    help: 'No judgment either way — this shapes how much your context files matter.' },
  { id: 'a2', block: 'agents', q: 'Where does business context live for your agents today?', kind: 'chips', required: true,
    options: ['nowhere — I re-explain every session', 'scattered across prompts and rules files', 'a docs folder', 'CLAUDE.md or AGENTS.md exists'],
    help: 'Code context is solved. This asks about the business: who pays, why this exists, what is decided.' },
  { id: 'a3', block: 'agents', q: 'Which agents and AI tools run in your stack?', kind: 'text', required: false,
    help: 'Name them like teammates — they are the audience for what you export at the end.',
    example: 'e.g. Claude Code, Cursor, a LangChain pipeline' },

  // -- Block 3 · Users & evidence (3)
  { id: 'u1', block: 'users', q: 'Who uses it today?', kind: 'chips', required: true,
    options: ['just me', 'friends and testers', 'strangers found it', 'people pay for it'],
    help: 'Honest answer wanted — “just me” is a stage, not a failure.' },
  { id: 'u2', block: 'users', q: 'Users (or transactions) per month, a year from now?', kind: 'number', required: true,
    help: 'Your month-12 guess, one number. A guess is fine — we mark it as one.', example: 'e.g. 400' },
  { id: 'u3', block: 'users', q: 'Strongest single evidence someone wants this?', kind: 'text', required: true,
    help: 'A quote, a star spike, a stranger issue, a DM. We will quote it back in the report.' },

  // -- Block 4 · Money & moat (6)
  { id: 'b1', block: 'business', q: 'What triggers payment?', kind: 'chips', required: true,
    options: ['a subscription', 'metered by usage', 'per transaction or event', 'paying for my time'],
    signals: { 'a subscription': [['saas_subscription', 3]], 'metered by usage': [['usage_based', 3]],
      'per transaction or event': [['transactional', 2], ['marketplace', 1]], 'paying for my time': [['services', 3]] },
    help: 'The trigger shapes the whole engine: subscriptions, metered use, per-event, or your time.' },
  { id: 'b2', block: 'business', q: 'Does money pass through you between two parties?', kind: 'chips', required: true,
    options: ['yes — payment flows through us', 'no — they pay me directly', 'no money moves yet'],
    signals: { 'yes — payment flows through us': [['marketplace', 3]],
      'no — they pay me directly': [['saas_subscription', 1], ['services', 1]] },
    help: 'Touching the money is a structural tell — it is what lets a marketplace defend its cut.' },
  { id: 'b3', block: 'business', q: 'Who exactly pays — a title or a person?', kind: 'text', required: true,
    help: 'The person whose card gets charged — a title beats a persona.' },
  { id: 'b4', block: 'business', q: 'Rough price per user (or per transaction), dollars per month?', kind: 'number', required: true,
    help: 'Magnitude, not precision — the middle of your range.', example: 'e.g. 20' },
  { id: 'b5', block: 'business', q: 'Monthly growth guess for year one, percent?', kind: 'number', required: true,
    help: 'Month-over-month growth as one number. It becomes a named, testable assumption.', example: 'e.g. 15' },
  { id: 'b6', block: 'business', q: 'What is hard to copy?', kind: 'chips', required: false,
    options: ['data or context it accumulates', 'the user network', 'deep workflow integration', 'honestly, nothing yet'],
    help: '“Nothing yet” is a legitimate answer — naming it makes it a workable problem.' },
]

const BY_ID = Object.fromEntries(INSTRUMENT.map((q) => [q.id, q]))
const BLOCKS = ['built', 'agents', 'users', 'business']

const WHY_TEMPLATES = {
  marketplace: 'You make a transaction possible between groups who could not find each other on their own — the defining shape of a marketplace. Your economics live in the take rate and in liquidity on both sides.',
  saas_subscription: 'People sign on for an ongoing relationship with software that works the same way month to month — the defining shape of a subscription. Your economics live in retention and expansion.',
  usage_based: 'Payment tracks how much people actually consume — the defining shape of usage-based revenue. Your economics live in the usage curve and unit cost.',
  transactional: 'People pay per event and return when the need returns — the defining shape of transactional revenue. Your economics live in repeat rate and cost per acquisition.',
  services: 'You deliver the outcome yourself, priced per engagement — the defining shape of productized services. Your economics live in utilization and scope discipline.',
}

const ASSUMPTIONS = {
  marketplace: [
    'Your take rate holds once both sides realize they could go direct — your matching and trust layer must be worth the cut.',
    'Supply comes cheap enough to keep liquidity ahead of demand.',
    'Demand rebooks — a marketplace without repeat demand is lead-gen in a costume.',
    'Liquidity concentrates — one dense niche beats ten thin ones.',
    'You keep processing the payment; touching the money is what defends the cut.',
  ],
  saas_subscription: [
    'Monthly churn stays low enough that growth is not refilling a leaky bucket — retention is the whole engine.',
    'Growth survives past your warm network of devs who already know you.',
    'The buyer keeps paying when the champion changes jobs.',
    'Onboarding self-serves — a founder-led demo per seat does not scale.',
    'Expansion revenue appears by month 12, or the pricing is too flat.',
  ],
  usage_based: [
    'Usage grows with user success — otherwise revenue caps where the user plateaus.',
    'Your unit cost (compute, API calls, tokens) falls faster than your price per unit.',
    'Heavy users do not churn to fixed-price competitors.',
    'A floor (minimum commit) is acceptable to buyers.',
    'Metering is trusted — billing disputes kill usage models.',
  ],
  transactional: [
    'The need recurs often enough that acquisition cost amortizes across repeat events.',
    'You stay first-recall between events — the return path is owned, not rented.',
    'Per-event price bears your true cost of acquisition.',
    'Volume seasonality does not starve the trough months.',
    'An adjacent recurring layer exists when you want smoother revenue.',
  ],
  services: [
    'Scope is productized — every engagement looks 80% like the last one.',
    'Utilization holds above breakeven as you add people.',
    'Price anchors to the human it replaces, not hours.',
    'Delivery quality survives you stepping out.',
    'A software layer accumulates so margin can climb later.',
  ],
}

// ---------------------------------------------------------------------------
// Classifier — deterministic; every point cites the founder's own answer.
// ---------------------------------------------------------------------------

export function classify(answers) {
  const scores = Object.fromEntries(MODELS.map((m) => [m, 0]))
  const trace = []
  for (const [qid, value] of Object.entries(answers ?? {})) {
    const q = BY_ID[qid]
    if (!q?.signals) continue
    for (const [model, weight] of q.signals[String(value).trim()] ?? []) {
      scores[model] += weight
      trace.push({ question: q.q, answer: value, model, weight })
    }
  }

  // Rank with a neutral tie-break: score, then how many DISTINCT answers
  // corroborate the model, then name — never array order.
  const corroborating = Object.fromEntries(
    MODELS.map((m) => [m, new Set(trace.filter((t) => t.model === m).map((t) => t.question)).size]),
  )
  const ranked = MODELS.map((m) => [m, scores[m]]).sort(
    (x, y) => y[1] - x[1] || corroborating[y[0]] - corroborating[x[0]] || (x[0] < y[0] ? -1 : 1),
  )
  const [top, topScore] = ranked[0]

  if (topScore === 0) {
    return {
      model: null, label: 'Not enough signal yet', confidence: 'insufficient', insufficient: true,
      scores, margin: 0, alternatives: [], trace: [], doctrine: [], doctrine_version: 'devrules-v0',
    }
  }

  const margin = topScore - ranked[1][1]
  const confidence = margin >= 3 && trace.length >= 5 ? 'high' : margin >= 1.5 ? 'medium' : 'low'
  return {
    model: top,
    label: MODEL_LABELS[top],
    confidence,
    scores,
    margin,
    alternatives: ranked.slice(1, 3).map(([m, s]) => ({ model: m, label: MODEL_LABELS[m], score: s })),
    trace,
    doctrine: MODEL_RULES[top],
    doctrine_version: 'devrules-v0',
  }
}

function scenarios(answers) {
  let customers = Number(answers?.u2) || 0
  let arpu = Number(answers?.b4) || 0
  let growth = (Number(answers?.b5) || 0) / 100
  const m12Revenue = customers * arpu
  const baseM1 = growth > 0 ? m12Revenue / (1 + growth) ** 11 : m12Revenue
  const out = {}
  for (const [name, g] of [['conservative', growth * 0.6], ['base', growth], ['optimistic', growth * 1.4]]) {
    const monthly = Array.from({ length: 12 }, (_, m) => Math.round(baseM1 * (1 + g) ** m))
    out[name] = { monthly, m12_arr: Math.round(monthly[11] * 12) }
  }
  return out
}

export function buildReport(answers, meta = {}, repo = null) {
  const verdict = classify(answers)
  const insufficient = Boolean(verdict.insufficient)
  const rules = evaluateRules(answers, repo, verdict)
  return {
    kind: 'bearing-report',
    generated_at: new Date().toISOString().slice(0, 19),
    prepared_for: meta.name ?? '',
    company_line: answers?.p1 ?? '',
    verdict,
    why: insufficient
      ? 'Your answers did not carry enough structural signal to call a model honestly — revisit the starred questions and we will call it from your words, not a default.'
      : WHY_TEMPLATES[verdict.model],
    assumptions: insufficient ? [] : ASSUMPTIONS[verdict.model],
    scenarios: scenarios(answers),
    evidence_quote: answers?.u3 ?? '',
    rules,
    repo,
  }
}

// ---------------------------------------------------------------------------
// Store — localStorage stands in for the server. Same promises, zero network.
// ---------------------------------------------------------------------------

const read = (k, fallback = null) => {
  try {
    const raw = localStorage.getItem(k)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))

export const getRid = () => localStorage.getItem(RID_KEY)
export const clearRid = () => {
  const rid = getRid()
  if (rid) {
    localStorage.removeItem(key(rid, 'answers'))
    localStorage.removeItem(key(rid, 'report'))
  }
  localStorage.removeItem(RID_KEY)
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem(REPO_KEY)
}

export const getProfile = () => read(PROFILE_KEY, {})
export const getRepoSignals = () => read(REPO_KEY)
export const setRepoSignals = (signals) => write(REPO_KEY, signals)

export const getInstrument = async () => ({
  blocks: BLOCKS,
  questions: INSTRUMENT,
})

export async function start(name = '', email = '', repoUrl = '') {
  const rid = `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  localStorage.setItem(RID_KEY, rid)
  write(PROFILE_KEY, { name, email, repoUrl })
  write(key(rid, 'answers'), {})
  return { rid }
}

export const getAnswers = async (rid) => ({
  answers: read(key(rid, 'answers'), {}),
  completed: Boolean(read(key(rid, 'report'))),
})

export async function saveAnswers(rid, batch) {
  write(key(rid, 'answers'), { ...read(key(rid, 'answers'), {}), ...batch })
  return { ok: true }
}

export async function complete(rid) {
  const answers = read(key(rid, 'answers'), {})
  const missing = INSTRUMENT.filter(
    (q) => q.required && [undefined, null, ''].includes(answers[q.id]),
  ).map((q) => q.id)
  if (missing.length) {
    const err = new Error('missing required answers')
    err.body = { missing }
    throw err
  }
  // Deterministic and local — the pause is honest pacing, not fake computation.
  await new Promise((r) => setTimeout(r, 900))
  write(key(rid, 'report'), buildReport(answers, getProfile(), getRepoSignals()))
  return { ok: true }
}

export async function getReport(rid) {
  const report = read(key(rid, 'report'))
  if (!report) {
    const err = new Error('no report yet')
    err.status = 404
    throw err
  }
  return report
}

export const fmtMoney = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0)
