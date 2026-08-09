/**
 * Bathymetric motif — Crater Lake depth contours as faint texture for
 * hero corners and empty states. Concentric ellipses in sapphire at
 * .06–.16 opacity. Ownable and Oregon — never generic mesh.
 */
export default function Bathymetric({ style, className = '' }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`bathymetric ${className}`}
      style={style}
    >
      <ellipse cx="360" cy="40" rx="46" ry="34" fill="none" stroke="rgba(95,134,238,.16)" />
      <ellipse cx="360" cy="40" rx="84" ry="62" fill="none" stroke="rgba(95,134,238,.12)" />
      <ellipse cx="360" cy="40" rx="128" ry="94" fill="none" stroke="rgba(95,134,238,.09)" />
      <ellipse cx="360" cy="40" rx="178" ry="130" fill="none" stroke="rgba(95,134,238,.06)" />
      <ellipse cx="360" cy="40" rx="236" ry="172" fill="none" stroke="rgba(95,134,238,.04)" />
    </svg>
  )
}
