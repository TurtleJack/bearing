# Bearing

**Your agents know your code. Nothing in your stack knows your business.**

Bearing maps the missing half. Point it at a public GitHub repo, answer sixteen
plain-language questions, and get: a business-model verdict with its reasoning
attached, a ranked gap report (rank + reason, never a score), a 12-month
scenario sketch from your own three numbers — and then the part that matters:
an exported `business-brain/` folder of plain markdown, plus one AGENTS.md
snippet, so every agent you already run (Claude Code, Cursor, Codex, anything
that reads files) starts every session knowing who pays and why this exists.

**Files are the interface. `git clone` is the export.**

Built in a two-hour window at a Portland hackathon. MIT licensed.

## Run it

```bash
npm install
npm run dev
```

No account, no API key, no server, no telemetry. Everything — classifier,
rules engine, export — runs in the browser tab. The "Use the demo repo" button
loads a bundled fixture, so the whole flow works offline.

## What's real, what's stubbed

| Piece | Status |
| --- | --- |
| Business-model classifier | **Real.** Deterministic weighted signals ([src/lib/engine.js](src/lib/engine.js)). Every point in the verdict cites the answer that produced it; thin signal returns "not enough signal" instead of a default. |
| Gap report | **Real.** 12 rules ([rules/dev-readiness.md](rules/dev-readiness.md)) evaluated against answers + repo signals. Ranked, reasoned, never scored. |
| Repo scan | **Real** (4 unauthenticated GitHub API reads, public repos only), **with a labeled fixture fallback** — any surface showing fixture data says so on screen. |
| Export | **Real.** 8 generated markdown files + zip, from your answers. No cloud copy exists. |
| Scenario chart | **Real math, founder-guess inputs** — three numbers you typed, compounded. It is a sketch and labeled as one. |
| Sign in | **Stubbed.** A localStorage profile. A real auth provider slots in at exactly one marked spot ([src/pages/Start.jsx](src/pages/Start.jsx)); for a hackathon, an account system would be theater. |
| Rule detectors | **v0.** Hand-written mirrors of the markdown ruleset; two rules honestly report "no detector yet." Parsing the markdown directly is the roadmap. |

## Why this exists

Every AI coding agent solved code context. Business context — who pays, what
the model is, what was already decided — lives in the founder's head and gets
re-typed into every session, imperfectly, or not at all. So agents build
confidently in an unchecked direction: the side project grows features instead
of a model.

Bearing's bet: the fix isn't another memory API. It's **files agents already
read**. The gap report makes the undecided visible; the export puts it where
your agents can't ignore it; the snippet asks every session to write back what
it learns. Judgment stays yours — Bearing never scores you, and when it didn't
check something, it says so.

## Portland

The target user is the Portland bench: indie hackers and senior engineers
between roles, shipping agent-built side projects that work — with no recorded
answer to "who pays, and why you?" The ruleset is one markdown file by design:
a local accelerator or meetup can fork [rules/dev-readiness.md](rules/dev-readiness.md),
encode its own methodology, and every founder's agents in the cohort inherit it.

## Layout

```
rules/dev-readiness.md   the open ruleset (the contribution surface)
src/lib/engine.js        instrument + classifier + report ("the backend" — localStorage)
src/lib/rules.js         rule detectors (mirrors the markdown, v0)
src/lib/github.js        repo signals (4 public API reads + fixture)
src/lib/exportBrain.js   the generated business-brain/ files
src/pages/               Landing → Start → Intake → Report → Export
packages/ui/             design tokens + small components (plain CSS variables)
```

## Provenance

Bearing is an open-source fork of ideas from a private founder-context product
by the same author — re-aimed at developers, rebuilt as a single local-first
app for this hackathon. The methodology content here (the ruleset, the
questions) is written fresh for this repo and MIT licensed like everything
else.
