import { complete, saveAnswers, setRepoSignals, start } from './engine.js'
import { demoRepoSignals } from './github.js'

/**
 * One-click sample session for evaluators: the bundled demo repo plus a full
 * set of prefilled answers, straight to a finished report. Labeled as a
 * sample everywhere it surfaces — "start over" on /start clears it.
 */
export const SAMPLE_ANSWERS = {
  p1: "An AI agent that drafts fair on-call rotations from a team's calendar and incident history",
  p2: 'just users',
  p3: 'software they run',
  p4: 'ongoing — they would miss it monthly',
  a1: 'most of it',
  a2: 'scattered across prompts and rules files',
  a3: 'Claude Code, Cursor',
  u1: 'friends and testers',
  u2: 300,
  u3: 'An SRE lead at a Portland meetup asked if she could pay for it before I finished the demo',
  b1: 'a subscription',
  b2: 'no — they pay me directly',
  b3: 'the engineering manager who owns the on-call budget',
  b4: 15,
  b5: 12,
  b6: 'honestly, nothing yet',
}

export async function loadSampleSession() {
  const { rid } = await start('a sample session', '', 'demo')
  setRepoSignals(demoRepoSignals())
  await saveAnswers(rid, SAMPLE_ANSWERS)
  await complete(rid)
  return rid
}
