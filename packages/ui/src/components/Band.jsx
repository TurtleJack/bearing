/**
 * Band — the Signal surface primitive.
 *
 * D-0074: in the PLATFORM, light and dark are user modes, not per-page
 * constants — so a Band defaults to `inherit`, declaring no surface and
 * letting every role resolve from the user's theme. Passing an explicit
 * 'dark' / 'light' is for compositions that genuinely mix both surfaces
 * within one screen (the marketing bands, the signed-out gate), never for
 * "this page is a light page".
 *
 * Props:
 *  - surface: 'inherit' (default) | 'dark' | 'light'
 *  - seam:    draw the 1px top hairline where a band begins
 *  - grain:   paper grain; a token, so it self-suppresses on dark
 *  - as:      element tag, defaults to 'section'
 */
export default function Band({
  surface = 'inherit',
  seam = false,
  grain = true,
  as: Tag = 'section',
  className = '',
  children,
  ...rest
}) {
  const pinned = surface === 'dark' || surface === 'light'
  const cls = [
    'band',
    seam && 'band--seam',
    // On a pinned light band the grain is unconditional; when inheriting it
    // rides var(--grain), which is `none` on dark.
    grain && (pinned ? surface === 'light' && 'band--grain' : 'band--grain-auto'),
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag data-surface={pinned ? surface : undefined} className={cls} {...rest}>
      {children}
    </Tag>
  )
}
