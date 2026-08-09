import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import JSZip from 'jszip'
import Band from '@ui/components/Band.jsx'
import Button from '@ui/components/Button.jsx'
import Eyebrow from '@ui/components/Eyebrow.jsx'
import FlowFrame from '../components/FlowFrame.jsx'
import { getAnswers, getProfile, getReport, getRid } from '../lib/engine.js'
import { AGENTS_SNIPPET, buildBrainFiles } from '../lib/exportBrain.js'

/**
 * Export — the brain leaves as files. Tabs + per-file copy make the demo
 * survive even a broken zip path; the zip is the convenience, not the product.
 */
export default function Export() {
  const rid = getRid()
  const [files, setFiles] = useState(null)
  const [active, setActive] = useState('business-brain/README.md')
  const [copied, setCopied] = useState('')
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!rid) return
    Promise.all([getReport(rid), getAnswers(rid)])
      .then(([report, saved]) =>
        setFiles(buildBrainFiles({ report, answers: saved.answers, repo: report.repo, profile: getProfile() })),
      )
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [rid])

  const names = useMemo(() => (files ? Object.keys(files) : []), [files])

  async function downloadZip() {
    const zip = new JSZip()
    for (const [name, content] of Object.entries(files)) {
      if (name.startsWith('business-brain/')) zip.file(name, content)
    }
    zip.file('AGENTS.md-snippet.md', AGENTS_SNIPPET)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'business-brain.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copy(name) {
    try {
      await navigator.clipboard.writeText(files[name])
      setCopied(name)
      setTimeout(() => setCopied(''), 1600)
    } catch {
      // Clipboard blocked — the text is selectable right below.
    }
  }

  if (!rid) return <Navigate to="/start" replace />
  if (checked && !files) {
    return (
      <FlowFrame>
        <Band surface="light">
          <div className="shell" style={{ padding: '4rem 0' }}>
            <h2>Nothing to export yet.</h2>
            <p style={{ opacity: 0.75 }}>
              The brain is generated from your report. <Link to="/intake">Finish the intake first →</Link>
            </p>
          </div>
        </Band>
      </FlowFrame>
    )
  }
  if (!files) return null

  return (
    <FlowFrame>
      <Band surface="dark" seam>
        <div className="shell band-pad">
          <Eyebrow tone="action">Export · the brain leaves as files</Eyebrow>
          <h1 style={{ maxWidth: '24ch' }}>Drop this folder in your repo. Every agent starts warm.</h1>
          <p style={{ maxWidth: '44rem', color: 'var(--ink-muted)' }}>
            Eight markdown files, generated from your answers. Unzip
            business-brain/ into your project root, paste the snippet into your
            AGENTS.md or CLAUDE.md, and commit. Claude Code, Cursor, Codex —
            they all read files. Files are the interface.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
            <Button size="lg" onClick={downloadZip}>Download business-brain.zip</Button>
            <Button variant="secondary" onClick={() => copy('AGENTS.md (snippet)')}>
              {copied === 'AGENTS.md (snippet)' ? 'Copied ✓' : 'Copy the AGENTS.md snippet'}
            </Button>
          </div>
          <p className="mono" style={{ fontSize: 10, color: 'var(--faint)', marginTop: 16 }}>
            NO CLOUD COPY EXISTS. THIS ZIP IS THE ENTIRE PRODUCT OUTPUT.
          </p>
        </div>
      </Band>

      <Band surface="light">
        <div className="shell band-pad">
          <Eyebrow>Read it before you ship it</Eyebrow>
          <div className="export-files" role="tablist" aria-label="Generated files">
            {names.map((name) => (
              <button
                key={name}
                role="tab"
                aria-selected={active === name}
                className={active === name ? 'is-on' : ''}
                onClick={() => setActive(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="export-view">
            <div className="export-view__bar">
              <span>{active}</span>
              <button onClick={() => copy(active)}>{copied === active ? 'COPIED ✓' : 'COPY'}</button>
            </div>
            <pre>{files[active]}</pre>
          </div>
          <p style={{ marginTop: 24, maxWidth: '44rem', color: 'var(--ink-muted)' }}>
            Then keep it alive: the snippet asks every agent to write
            business-shaped learnings back to decisions.md. The brain compounds
            only if sessions write back — that is the whole method.
          </p>
        </div>
      </Band>
    </FlowFrame>
  )
}
