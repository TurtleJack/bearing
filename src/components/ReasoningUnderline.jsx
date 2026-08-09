/**
 * Reasoning underline — the Signal signature. Any AI-produced value or
 * verdict gets a dotted sapphire underline; hover (or focus) reveals a
 * trace popover citing the founder's own inputs. The popover is always
 * a dark artifact, whatever band it sits in.
 *
 *  - trace: node — the trace copy
 *  - kicker: optional mono kicker inside the popover (e.g. "How we reached this")
 *  - strong: 2px underline (display-size verdicts)
 *  - plain: keep the surrounding text color (underline only)
 *  - align: 'left' | 'right' popover alignment
 */
export default function ReasoningUnderline({
  trace,
  kicker,
  strong = false,
  plain = false,
  align = 'left',
  className = '',
  children,
}) {
  const cls = [
    'rtrace',
    strong && 'rtrace--strong',
    plain && 'rtrace--plain',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls} tabIndex={0}>
      {children}
      <span
        className={`rtrace__pop ${align === 'right' ? 'rtrace__pop--right' : ''}`}
        role="tooltip"
      >
        {kicker && <span className="rtrace__pop-kicker">{kicker}</span>}
        {trace}
      </span>
    </span>
  )
}
