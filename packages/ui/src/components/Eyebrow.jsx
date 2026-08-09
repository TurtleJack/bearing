/** Mono eyebrow — 10px / .14em tracking / uppercase. tone: default | action | signal */
export default function Eyebrow({ tone, className = '', children, ...rest }) {
  const cls = ['eyebrow', tone && `eyebrow--${tone}`, className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}
