import { Link } from 'react-router-dom'
import Band from '@ui/components/Band.jsx'
import Bathymetric from '../components/Bathymetric.jsx'
import Button from '@ui/components/Button.jsx'
import Eyebrow from '@ui/components/Eyebrow.jsx'
import Footer from '../components/Footer.jsx'
import SignalLoader from '@ui/components/SignalLoader.jsx'
import Wordmark from '@ui/components/Wordmark.jsx'

/**
 * Landing — dark lands the promise, light gives the argument room to read,
 * dark closes. All CTAs go to /start; there is nothing to sign up for.
 */
export default function Landing() {
  return (
    <>
      {/* ── Dark: the promise ── */}
      <Band surface="dark" className="home-hero" as="header">
        <Bathymetric style={{ top: 0, right: 0, width: 520, height: '100%', opacity: 0.7 }} />
        <div className="home-hero__signal" aria-hidden="true">
          <SignalLoader variant="md" surface="dark" play="once" label="" />
        </div>
        <div className="shell">
          <nav className="home-nav">
            <Wordmark size={22} />
            <div className="home-nav__links">
              <a className="home-nav__link" href="#engine">How it works</a>
              <a className="home-nav__link" href="#honest">What&apos;s real</a>
              <a className="home-nav__link" href="#portland">Portland</a>
              <Button to="/start">Map my starting point →</Button>
            </div>
          </nav>
          <div className="home-hero__inner home-hero__inner--enter">
            <Eyebrow tone="action">Bearing · open source · runs on your device</Eyebrow>
            <h1 className="display" style={{ margin: '20px 0 0' }}>
              Your agents know your code.
              <br />
              Nothing knows your business.
            </h1>
            <p className="home-hero__sub">
              You ship with Claude Code, Cursor, Codex — and every one of them is
              brilliant about your codebase and <b>blank about your business</b>: who
              pays, why this exists, what you already decided. Bearing maps that
              missing half and ships it back into your repo, where your agents can
              read it.
            </p>
            <div className="cta-row">
              <Button size="lg" to="/start">See what your project is missing →</Button>
            </div>
          </div>
        </div>
      </Band>

      {/* ── Light: the problem ── */}
      <Band surface="light">
        <div className="shell home-sec">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="h2">Code context is solved. Business context lives nowhere.</h2>
          <p className="lede">
            Your last twenty commits are pointing somewhere — and nothing in your
            stack is looking. The agents answer the questions you knew to ask,
            framed your way, with your assumptions baked in. They will never
            interrupt to say <em>you still haven&apos;t decided who pays for this</em>.
            So the side project grows features instead of a model.
          </p>
          <div className="zero-row">
            <div className="zero">
              <b>Monday, 9:04am</b>&quot;Let me explain who this is actually for again…&quot;
            </div>
            <div className="zero">
              <b>Wednesday, 2:37pm</b>&quot;No — we decided against usage pricing last month.&quot;
            </div>
            <div className="zero">
              <b>Friday, 6:12pm</b>&quot;Why did my agent just build a pricing page I never designed?&quot;
            </div>
          </div>
        </div>

        <div className="shell home-sec" id="engine">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="h2">Repo in. Brain out. Ten minutes, no server.</h2>
          <p className="lede">
            Three moving parts, all deterministic, all inspectable — this is the
            open-source part, not the demo part.
          </p>
          <div className="engine-cards">
            <div className="engine-card">
              <Eyebrow tone="action">01 · The intake</Eyebrow>
              <h3 className="h3">Your repo + sixteen questions</h3>
              <p>
                Bearing reads a public GitHub repo — agent config files, AI
                dependencies, license posture — then asks sixteen plain-language
                questions about who shows up, what triggers payment, and where
                your agents get context. <code>No account, no API key</code>.
              </p>
            </div>
            <div className="engine-card">
              <Eyebrow tone="action">02 · The gap report</Eyebrow>
              <h3 className="h3">Rank and reason. Never a score.</h3>
              <p>
                A business-model verdict with its reasoning attached — every
                point traces to your own words — and the top three decisions you
                haven&apos;t made yet, checked against an open ruleset.{' '}
                <code>No grades, no progress bars</code>.
              </p>
            </div>
            <div className="engine-card">
              <Eyebrow tone="action">03 · The export</Eyebrow>
              <h3 className="h3">Files are the interface</h3>
              <p>
                The brain leaves as a <code>business-brain/</code> folder of
                plain markdown plus one AGENTS.md snippet. Commit it, and every
                agent you already run loads business context —{' '}
                <code>git clone is the export</code>.
              </p>
            </div>
          </div>
        </div>
      </Band>

      {/* ── Dark: honest by construction ── */}
      <Band surface="dark" seam id="honest">
        <div className="shell home-sec">
          <Eyebrow tone="signal">What&apos;s real, what&apos;s stubbed</Eyebrow>
          <h2 className="h2">Honest by construction.</h2>
          <p className="lede">
            Built in a two-hour hackathon window, and labeled like it. The parts
            that run are real; the parts that are stand-ins say so on screen.
          </p>
          <div className="vows">
            <div className="vow">
              <b>Real: the classifier.</b>
              <span>
                Deterministic weighted signals — every point in the verdict cites
                the answer that produced it, and thin signal returns &quot;not enough
                signal&quot; instead of a default.
              </span>
            </div>
            <div className="vow">
              <b>Real: the rules engine and export.</b>
              <span>
                Twelve dev-readiness checks against your answers and repo, and a
                generated markdown brain. All of it runs offline, in this tab.
              </span>
            </div>
            <div className="vow">
              <b>Stubbed: auth.</b>
              <span>
                Sign-in is a localStorage profile. A real auth provider slots in
                at exactly one marked spot — for a hackathon, an account system
                would be theater.
              </span>
            </div>
            <div className="vow">
              <b>v0: the ruleset.</b>
              <span>
                Twelve rules, three of which honestly report &quot;no detector yet.&quot;
                The ruleset is an open markdown file — the roadmap is PRs, not
                promises.
              </span>
            </div>
          </div>
        </div>
      </Band>

      {/* ── Light: Portland ── */}
      <Band surface="light">
        <div className="shell home-sec" id="portland">
          <Eyebrow>Who this is for</Eyebrow>
          <h2 className="h2">
            Portland ships more side projects than
            <br />
            it ships <em style={{ fontStyle: 'italic' }}>companies</em>.
          </h2>
          <div className="who-grid">
            <ul>
              <li>
                <b>Indie hackers</b> with an agent-built project that works — and
                no recorded answer to &quot;who pays, and why you?&quot;
              </li>
              <li>
                <b>Senior engineers between roles</b> — Portland has a deep bench
                of them — turning a portfolio piece into an income, without hiring
                a strategist to ask the structural questions.
              </li>
              <li>
                <b>Meetups, accelerators, cohorts</b> — the ruleset is a markdown
                file. A Portland accelerator can fork it, encode its own
                methodology, and every local founder&apos;s agents inherit it.
              </li>
            </ul>
            <div className="not-you">
              <b>An honest boundary:</b> Bearing doesn&apos;t make your product good
              or your model true. It makes the undecided visible and puts it
              where your agents can&apos;t ignore it. Judgment stays yours.
            </div>
          </div>
        </div>
      </Band>

      {/* ── Dark: the close ── */}
      <Band surface="dark" seam className="home-finale">
        <Bathymetric
          style={{ bottom: 0, left: 0, width: 460, height: '100%', opacity: 0.5, transform: 'scale(-1)' }}
        />
        <div className="shell home-finale__inner">
          <Eyebrow tone="action">Free · open source · yours</Eyebrow>
          <h2 className="display" style={{ margin: '16px 0 0' }}>
            Stop being your agents&apos;
            <br />
            business memory.
          </h2>
          <p className="lede" style={{ maxWidth: 560 }}>
            Ten minutes from repo to a business brain your agents can load.
            Everything runs in this tab — the honest kind of demo.
          </p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <Button size="lg" to="/start">Map my starting point →</Button>
          </div>
          <div className="cohort-line">
            MIT licensed. No server, no telemetry, no account.{' '}
            <Link to="/start" style={{ color: 'inherit' }}>The demo repo works offline.</Link>
          </div>
        </div>
      </Band>

      <Footer />
    </>
  )
}
