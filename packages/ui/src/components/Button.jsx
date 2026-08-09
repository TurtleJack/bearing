import { Link } from 'react-router-dom'

/**
 * Signal button. One primary per view.
 *  - variant: 'primary' | 'secondary' | 'ghost'
 *  - to: internal route (renders a Link) · href: external (renders <a>)
 */
export default function Button({
  variant = 'primary',
  size,
  to,
  href,
  className = '',
  children,
  ...rest
}) {
  const cls = ['btn', `btn--${variant}`, size === 'lg' && 'btn--lg', className]
    .filter(Boolean)
    .join(' ')

  if (to)
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
