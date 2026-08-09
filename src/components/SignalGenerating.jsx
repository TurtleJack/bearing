import { useEffect, useState } from 'react'
import Band from '@ui/components/Band.jsx'
import Bathymetric from './Bathymetric.jsx'
import SignalLoader, { SIGNAL_PHRASES } from '@ui/components/SignalLoader.jsx'

/**
 * SignalGenerating — full-screen wait between CTA and verdict. The engine is
 * deterministic and local; the pause is pacing, and after ~3s the line below
 * says so honestly (no fake %).
 */

export const RMR_PHRASES = [
  'Reading your answers against the rules',
  ...SIGNAL_PHRASES,
]

export default function SignalGenerating({
  phrases = RMR_PHRASES,
  label = 'Generating',
  honestyAfterMs = 3000,
  honesty = 'Still working — everything runs on this device',
}) {
  const [longWait, setLongWait] = useState(false)

  useEffect(() => {
    if (!honestyAfterMs) return undefined
    const t = setTimeout(() => setLongWait(true), honestyAfterMs)
    return () => clearTimeout(t)
  }, [honestyAfterMs])

  return (
    <Band
      surface="dark"
      className="signal-generating"
      as="div"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <Bathymetric
        style={{
          top: 0,
          right: 0,
          width: 420,
          height: '100%',
          opacity: 0.45,
        }}
      />
      <div className="signal-generating__inner">
        <SignalLoader
          variant="hero"
          surface="dark"
          showPhrase
          phrases={phrases}
          label={label}
        />
        {longWait && honesty && (
          <p className="signal-generating__honesty mono">{honesty}</p>
        )}
      </div>
    </Band>
  )
}
