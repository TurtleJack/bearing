import DEMO_REPO from '../fixtures/demoRepo.json'

/**
 * Repo seeding — four unauthenticated GitHub API calls, 4s timeout each.
 * Public repos only; no token, no scopes. Any failure degrades to the bundled
 * fixture with source marked so every surface can say so honestly.
 */

const AI_DEPS = [
  'openai', '@anthropic-ai/sdk', '@anthropic-ai/claude-agent-sdk', 'anthropic',
  'langchain', '@langchain/core', 'ai', 'llamaindex',
  '@modelcontextprotocol/sdk', 'ollama',
]

const AGENT_FILES = ['CLAUDE.md', 'AGENTS.md', '.cursor', '.cursorrules', '.mcp.json', '.claude']

export const demoRepoSignals = () => ({ ...DEMO_REPO })

export function parseRepoUrl(input) {
  const t = String(input ?? '').trim().replace(/\.git$/, '').replace(/\/+$/, '')
  const m =
    t.match(/github\.com[/:]([^/\s]+)\/([^/\s]+)/) ??
    t.match(/^([\w.-]+)\/([\w.-]+)$/)
  return m ? { owner: m[1], repo: m[2] } : null
}

async function gh(path, accept = 'application/vnd.github+json') {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 4000)
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: { Accept: accept },
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`GitHub ${res.status}`)
    return accept.includes('raw') ? res.text() : res.json()
  } finally {
    clearTimeout(t)
  }
}

export async function fetchRepoSignals(input) {
  const parsed = parseRepoUrl(input)
  if (!parsed) throw new Error('Not a GitHub repo URL')
  const base = `/repos/${parsed.owner}/${parsed.repo}`

  const [meta, readme, pkg, contents] = await Promise.all([
    gh(base), // required — if this fails, the whole fetch fails
    gh(`${base}/readme`, 'application/vnd.github.raw+json').catch(() => ''),
    gh(`${base}/contents/package.json`).catch(() => null),
    gh(`${base}/contents/`).catch(() => []),
  ])

  let deps = []
  if (pkg?.content) {
    try {
      const json = JSON.parse(atob(pkg.content.replace(/\n/g, '')))
      deps = Object.keys({ ...json.dependencies, ...json.devDependencies })
    } catch {
      deps = []
    }
  }

  const rootNames = Array.isArray(contents) ? contents.map((e) => e.name) : []
  const headings = String(readme)
    .split('\n')
    .filter((l) => /^#{1,2}\s/.test(l))
    .map((l) => l.replace(/^#+\s*/, '').trim())
    .slice(0, 8)

  return {
    source: 'github',
    name: meta.name,
    url: meta.html_url,
    description: meta.description ?? '',
    language: meta.language ?? '',
    stars: meta.stargazers_count ?? 0,
    topics: meta.topics ?? [],
    readmeHeadings: headings,
    deps,
    aiDeps: deps.filter((d) => AI_DEPS.some((a) => d === a || d.startsWith(`${a}/`))),
    agentFiles: AGENT_FILES.filter((f) => rootNames.includes(f)),
    hasLicense: Boolean(meta.license) || rootNames.some((n) => /^license/i.test(n)),
    hasBusinessBrain: rootNames.includes('business-brain'),
  }
}
