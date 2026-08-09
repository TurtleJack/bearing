# Dev-readiness rules — devrules-v0

The open ruleset Bearing checks a project against. This file is the canonical
artifact; `src/lib/rules.js` mirrors it as hand-written detectors (parsing this
file directly is the roadmap — PRs welcome).

**The contract:**

- Statuses are `satisfied` / `partial` / `absent` / `unimplemented`. v0 has no
  `contradicted` — there is nothing recorded yet to contradict; the status
  arrives when brains persist across sessions.
- Gaps are ranked and reasoned, **never scored**. No composite number, grade,
  percentage, or progress bar may be derived from these rules.
- A rule with no detector reports `unimplemented`, out loud. Naming the
  coverage limit is a feature.
- Rules with `Stage: opinion` are one practitioner's judgment. They may be
  suggested — they are **never counted as gaps**.

**Contributing:** accelerators, meetups, and cohort programs are the intended
forkers. Encode your methodology in this format, keep the no-scores contract,
and every founder's agents in your program inherit it.

---

### DEV-01 — A buyer is named
- **Satisfied when:** a specific payer (title or person) is on the record.
- **Stage:** foundation
- **Rationale:** Agents optimize for whoever you describe. Describe no one and they optimize for everyone.
- **Confidence:** battle-tested

### DEV-02 — A pricing model is chosen
- **Satisfied when:** a payment trigger is chosen and a rough price is attached to it.
- **Stage:** foundation
- **Rationale:** A price is a decision, not a discovery. Undecided pricing leaks into every roadmap conversation.
- **Confidence:** battle-tested

### DEV-03 — Willingness-to-pay evidence exists
- **Satisfied when:** someone pays today; partial when evidence exists but no revenue.
- **Stage:** foundation
- **Rationale:** One real signal that someone will pay outranks any amount of roadmap.
- **Confidence:** battle-tested

### DEV-04 — Revenue trigger matches the structure
- **Satisfied when:** the chosen payment trigger agrees with the structural verdict.
- **Stage:** model
- **Rationale:** Charging like a SaaS while operating like a marketplace is a quiet, expensive contradiction.
- **Confidence:** evidenced

### DEV-05 — A moat is stated
- **Satisfied when:** something hard to copy is on the record ("nothing yet" is honest, and a gap).
- **Stage:** model
- **Rationale:** Investors ask "why you" second. Agents never ask it at all unless it is written down.
- **Confidence:** evidenced

### DEV-06 — Your agents have a context home
- **Satisfied when:** a CLAUDE.md / AGENTS.md / .cursor exists (reported or detected in the repo).
- **Stage:** agents
- **Rationale:** Context that lives in your head gets re-typed into every session, imperfectly.
- **Confidence:** battle-tested

### DEV-07 — Business context reaches your agents
- **Satisfied when:** an agent-readable file (business-brain/) carries who pays, the model, and the moat.
- **Stage:** agents
- **Rationale:** Agents with code context and no business context build confidently in an unchecked direction.
- **Confidence:** evidenced

### DEV-08 — A unit-economics sketch exists
- **Satisfied when:** volume, price, and growth are each named, even as guesses.
- **Stage:** numbers
- **Rationale:** Three rough numbers beat zero precise ones. Investors read the sketch, not the spreadsheet.
- **Confidence:** evidenced

### DEV-09 — Usage is measured
- **Satisfied when:** a usage-based model meters the thing it bills. (No detector in v0 — reports `unimplemented`.)
- **Stage:** numbers
- **Rationale:** A usage-based model without metering is a subscription with extra steps.
- **Confidence:** hypothesis

### DEV-10 — A two-sided liquidity plan exists
- **Satisfied when:** a marketplace names its cold-start side and first dense niche. (No detector in v0 — reports `unimplemented`.)
- **Stage:** model
- **Rationale:** A marketplace without a cold-start plan is a landing page with two audiences.
- **Confidence:** hypothesis

### DEV-11 — License posture is recorded
- **Satisfied when:** the repo ships a LICENSE file.
- **Stage:** foundation
- **Rationale:** Undefined rights block both adoption and diligence. A LICENSE file is a business decision.
- **Confidence:** battle-tested

### DEV-12 — A growth assumption is named
- **Satisfied when:** a month-over-month growth number is written down, even as a guess.
- **Stage:** opinion
- **Rationale:** Any named number beats an implied one — but the "right" rate is a judgment call, so this is a suggestion, never a gap.
- **Confidence:** hypothesis
