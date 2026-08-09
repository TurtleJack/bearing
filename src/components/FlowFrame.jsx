import { Link, useLocation } from 'react-router-dom'
import Wordmark from '@ui/components/Wordmark.jsx'
import { getRid } from '../lib/engine.js'

/**
 * FlowFrame — chrome around the four flow screens: the product lockup plus
 * the four-stop spine, in the mono metadata layer.
 */
const STAGES = [
  { label: 'Start', stop: 1, path: '/start', routes: ['/start'] },
  { label: 'Intake', stop: 2, path: '/intake', routes: ['/intake'] },
  { label: 'Report', stop: 3, path: '/report', routes: ['/report'] },
  { label: 'Export', stop: 4, path: '/export', routes: ['/export'] },
]

export default function FlowFrame({ children }) {
  const { pathname } = useLocation()
  const activeStage = Math.max(0, STAGES.findIndex((stage) => stage.routes.includes(pathname)))
  const hasSession = Boolean(getRid())

  return (
    <div data-surface="dark" className="flow-frame">
      <header className="flow-frame__bar">
        <div className="flow-frame__lockup">
          <Link to="/start">
            <Wordmark size={16} />
          </Link>
          <Link to="/" className="mono flow-frame__parent">
            OPEN SOURCE · MIT
          </Link>
        </div>

        <div className="flow-frame__right">
          <nav className="flow-frame__steps mono" aria-label="Bearing stages">
            {STAGES.map((stage, index) => {
              const className = [
                'flow-frame__step',
                index === activeStage && 'flow-frame__step--on',
                index > activeStage && 'flow-frame__step--locked',
              ].filter(Boolean).join(' ')

              const content = (
                <>
                  <span className="flow-frame__stop">{stage.stop}</span>
                  {stage.label}
                </>
              )

              if (hasSession && index < activeStage) {
                return (
                  <Link key={stage.path} to={stage.path} className={className}>
                    {content}
                  </Link>
                )
              }

              return (
                <span
                  key={stage.path}
                  className={className}
                  aria-current={index === activeStage ? 'step' : undefined}
                  aria-disabled={index > activeStage ? 'true' : undefined}
                >
                  {content}
                </span>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="flow-frame__screen">{children}</main>
    </div>
  )
}
