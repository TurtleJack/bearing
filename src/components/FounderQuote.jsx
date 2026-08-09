import Eyebrow from '@ui/components/Eyebrow.jsx'

/**
 * Serif, for their words only — Newsreader italic with a 2px sapphire
 * left border. Used almost never: only to quote the founder back.
 */
export default function FounderQuote({ source, className = '', children }) {
  return (
    <figure className={`founder-quote ${className}`} style={{ margin: 0 }}>
      <blockquote className="founder-quote__text" style={{ margin: 0 }}>
        {children}
      </blockquote>
      {source && (
        <figcaption className="founder-quote__source">
          <Eyebrow>— {source}</Eyebrow>
        </figcaption>
      )}
    </figure>
  )
}
