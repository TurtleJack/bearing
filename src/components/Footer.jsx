import { Link } from 'react-router-dom'
import Wordmark from '@ui/components/Wordmark.jsx'

export default function Footer() {
  return (
    <footer data-surface="dark" style={{ background: 'var(--canvas)', borderTop: '1px solid var(--hairline)' }}>
      <div
        className="shell"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '28px 0' }}
      >
        <Wordmark size={14} />
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--faint)' }}>
          OPEN SOURCE · MIT · BUILT AT A PORTLAND HACKATHON · EVERYTHING RUNS ON YOUR DEVICE
        </span>
        <Link to="/start" className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-muted)' }}>
          MAP YOUR STARTING POINT →
        </Link>
      </div>
    </footer>
  )
}
