import { useEffect, useState } from 'react'

/**
 * Signal Loader — branded 8C-mark wait affordance (D-0031 / CTX-85).
 * Sounding / signal loop · 1.8s. Forbidden: generic CSS/Lottie spinners.
 *
 * Variants (size ladder from specimen):
 *   hero   ~168 — full sonar + arcs + dots; optional phrase rotator
 *   md     ~92  — panel / card
 *   micro  ~40  — drops outer signal detail
 *   button ~20  — in-CTA (2 arcs + single ray)
 *
 * Surfaces: dark | light | onbrand (pale-blue data on sapphire CTAs)
 */

export const SIGNAL_PHRASES = [
  'Dreaming on your company brain',
  'Your context, still here — building on it',
  "Connecting the dots you've been circling",
  'Picking up where we left off',
]

const SIZES = { hero: 168, md: 92, micro: 40, button: 20 }

// D-0074: 'auto' follows the user's mode. The literals below are exactly
// what --text-primary / --accent resolve to on each surface, so auto is the
// same drawing without the caller having to know which mode it is in.
// The explicit surfaces remain for compositions that pin one (the marketing
// bands) and for brand/photo backgrounds.
const SURFACES = {
  auto: { ink: 'var(--text-primary)', data: 'var(--accent)' },
  dark: { ink: '#F4F8F3', data: '#4FD4F2' },
  light: { ink: '#12211C', data: '#0A6C86' },
  onbrand: { ink: '#FFFFFF', data: '#BFF3FF' },
}

function MarkSvg({ variant, ink, data }) {
  const common = {
    viewBox: '0 0 100 100',
    width: '100%',
    height: '100%',
    style: { display: 'block', overflow: 'visible' },
    'aria-hidden': true,
  }

  if (variant === 'button') {
    return (
      <svg {...common}>
        <g fill="none" stroke={ink} strokeLinecap="round">
          <path
            d="M50 33 A17 17 0 0 0 50 67"
            strokeWidth="8"
            className="signal-loader__arc"
          />
          <path
            d="M50 18 A32 32 0 0 0 50 82"
            strokeWidth="8.5"
            className="signal-loader__arc"
            style={{ animationDelay: '0.25s' }}
          />
        </g>
        <g stroke={data} strokeWidth="8" strokeLinecap="round" opacity="0.55">
          <line x1="52" y1="50" x2="86" y2="50" />
        </g>
        <circle
          cx="86"
          cy="50"
          r="5.5"
          fill={data}
          className="signal-loader__dot"
          style={{ animationDelay: '0.2s' }}
        />
        <circle cx="50" cy="50" r="6.5" fill={data} className="signal-loader__node" />
      </svg>
    )
  }

  if (variant === 'micro') {
    return (
      <svg {...common}>
        <g fill="none" stroke={ink} strokeLinecap="round">
          <path
            d="M50 39 A11 11 0 0 0 50 61"
            strokeWidth="6"
            className="signal-loader__arc"
          />
          <path
            d="M50 27 A23 23 0 0 0 50 73"
            strokeWidth="6.5"
            className="signal-loader__arc"
            style={{ animationDelay: '0.2s' }}
          />
          <path
            d="M50 15 A35 35 0 0 0 50 85"
            strokeWidth="7"
            className="signal-loader__arc"
            style={{ animationDelay: '0.4s' }}
          />
        </g>
        <g stroke={data} strokeWidth="6" strokeLinecap="round" opacity="0.5">
          <line x1="56" y1="40.5" x2="81" y2="40.5" />
          <line x1="50" y1="50" x2="87" y2="50" />
          <line x1="56" y1="59.5" x2="81" y2="59.5" />
        </g>
        <g fill={data}>
          <circle
            cx="81"
            cy="40.5"
            r="3.4"
            className="signal-loader__dot"
            style={{ animationDelay: '0.1s' }}
          />
          <circle
            cx="87"
            cy="50"
            r="3.8"
            className="signal-loader__dot"
            style={{ animationDelay: '0.2s' }}
          />
          <circle
            cx="81"
            cy="59.5"
            r="3.4"
            className="signal-loader__dot"
            style={{ animationDelay: '0.3s' }}
          />
        </g>
        <circle cx="50" cy="50" r="5.6" fill={data} className="signal-loader__node" />
      </svg>
    )
  }

  // hero + md — full mark with sonar
  return (
    <svg {...common}>
      <g fill="none" stroke={data} strokeWidth="1.2">
        <circle cx="50" cy="50" r="10" className="signal-loader__sonar" />
        <circle
          cx="50"
          cy="50"
          r="10"
          className="signal-loader__sonar"
          style={{ animationDelay: '1.4s' }}
        />
      </g>
      <g fill="none" stroke={ink} strokeLinecap="round">
        <path
          d="M50 39 A11 11 0 0 0 50 61"
          strokeWidth="5"
          className="signal-loader__arc"
        />
        <path
          d="M50 27 A23 23 0 0 0 50 73"
          strokeWidth="5.5"
          className="signal-loader__arc"
          style={{ animationDelay: '0.2s' }}
        />
        <path
          d="M50 15 A35 35 0 0 0 50 85"
          strokeWidth="6"
          className="signal-loader__arc"
          style={{ animationDelay: '0.4s' }}
        />
      </g>
      <g stroke={data} strokeWidth="4.6" strokeLinecap="round" opacity="0.48">
        <line x1="56" y1="31" x2="70" y2="31" />
        <line x1="56" y1="40.5" x2="81" y2="40.5" />
        <line x1="50" y1="50" x2="87" y2="50" />
        <line x1="56" y1="59.5" x2="81" y2="59.5" />
        <line x1="56" y1="69" x2="70" y2="69" />
      </g>
      <g fill={data}>
        <circle cx="70" cy="31" r="2.8" className="signal-loader__dot" />
        <circle
          cx="81"
          cy="40.5"
          r="2.8"
          className="signal-loader__dot"
          style={{ animationDelay: '0.1s' }}
        />
        <circle
          cx="87"
          cy="50"
          r="3.2"
          className="signal-loader__dot"
          style={{ animationDelay: '0.2s' }}
        />
        <circle
          cx="81"
          cy="59.5"
          r="2.8"
          className="signal-loader__dot"
          style={{ animationDelay: '0.3s' }}
        />
        <circle
          cx="70"
          cy="69"
          r="2.8"
          className="signal-loader__dot"
          style={{ animationDelay: '0.4s' }}
        />
      </g>
      <circle cx="50" cy="50" r="4.8" fill={data} className="signal-loader__node" />
    </svg>
  )
}

function usePhraseRotator(phrases, enabled, intervalMs = 2800) {
  const [i, setI] = useState(0)
  const [on, setOn] = useState(true)

  useEffect(() => {
    if (!enabled) return undefined
    const bank = phrases?.length ? phrases : SIGNAL_PHRASES
    let fade
    const tick = setInterval(() => {
      setOn(false)
      fade = setTimeout(() => {
        setI((n) => (n + 1) % bank.length)
        setOn(true)
      }, 420)
    }, intervalMs)
    return () => {
      clearInterval(tick)
      clearTimeout(fade)
    }
  }, [enabled, phrases, intervalMs])

  const bank = phrases?.length ? phrases : SIGNAL_PHRASES
  return { phrase: bank[i % bank.length], on }
}

export default function SignalLoader({
  variant = 'md',
  surface = 'auto',
  size,
  phrase,
  phrases,
  showPhrase = false,
  showCaret = true,
  /** 'loop' = continuous wait · 'once' = one sounding cycle then settle (CTX-88) */
  play = 'loop',
  label = 'Loading',
  className = '',
  style,
}) {
  const px = size ?? SIZES[variant] ?? SIZES.md
  const colors = SURFACES[surface] || SURFACES.auto
  const rotating = showPhrase && phrase == null && play === 'loop'
  const { phrase: rotatingPhrase, on } = usePhraseRotator(phrases, rotating)
  const text = phrase ?? (showPhrase ? rotatingPhrase : null)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (play !== 'once') return undefined
    setSettled(false)
    // One sounding cycle (~1.8s) + brief settle
    const t = setTimeout(() => setSettled(true), 2000)
    return () => clearTimeout(t)
  }, [play])

  const busy = play === 'loop' || !settled

  return (
    <div
      className={[
        'signal-loader',
        `signal-loader--${variant}`,
        play === 'once' && 'signal-loader--once',
        settled && play === 'once' && 'signal-loader--settled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-busy={busy ? 'true' : 'false'}
      aria-label={label}
      style={style}
    >
      <div
        className="signal-loader__mark jq-anim"
        style={{
          width: px,
          height: px,
          color: colors.ink,
          ['--data']: colors.data,
          flex: 'none',
        }}
      >
        <MarkSvg variant={variant} ink={colors.ink} data={colors.data} />
      </div>
      {text != null && (
        <div className="signal-loader__status">
          <span
            className="signal-loader__phrase"
            style={{ opacity: rotating ? (on ? 1 : 0) : 1 }}
          >
            {text}
          </span>
          {showCaret && play === 'loop' && (
            <span className="signal-loader__caret" aria-hidden />
          )}
        </div>
      )}
    </div>
  )
}
