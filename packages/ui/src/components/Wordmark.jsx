export const PRODUCT = 'Bearing'

/**
 * Wordmark — plain text lockup. Rename the product by editing PRODUCT above.
 * Accepts `product` to override (kept for API compatibility) and `size` in px.
 */
export default function Wordmark({ product = PRODUCT, size = 18, className = '' }) {
  return (
    <span
      className={`wordmark ${className}`.trim()}
      style={{
        fontFamily: 'var(--font-mono, "Spline Sans Mono", monospace)',
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ink)',
      }}
    >
      {product}
    </span>
  )
}
