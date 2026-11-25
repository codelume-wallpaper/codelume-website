const STORAGE = 'https://storage.codelume.cn'
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const INSTALLER = /^releases\/Codelume-((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))\.dmg$/
const headers = { 'Cache-Control': 'public, max-age=60, s-maxage=60', 'X-Content-Type-Options': 'nosniff' }

async function releases(bucket) {
  const objects = []
  let cursor
  do {
    const page = await bucket.list({ prefix: 'releases/', delimiter: '/', limit: 1000, cursor })
    objects.push(...page.objects)
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  const keys = new Set(objects.map(({ key }) => key))
  return objects.flatMap((object) => {
    const match = INSTALLER.exec(object.key)
    if (!match || object.size <= 0) return []
    return [{
      version: match[1],
      url: `${STORAGE}/${object.key}`,
      size: object.size,
      publishedAt: new Date(object.uploaded).toISOString(),
      hasNotes: keys.has(`releases/Codelume-${match[1]}.txt`),
    }]
  }).sort((a, b) => b.version.localeCompare(a.version, 'en', { numeric: true }))
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname !== '/api/releases') return env.ASSETS.fetch(request)
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
    try {
      const version = url.searchParams.get('version')
      let response
      if (version !== null) {
        if (!VERSION.test(version)) return new Response(null, { status: 400 })
        const installer = await env.RELEASES.head(`releases/Codelume-${version}.dmg`)
        if (!installer || installer.size <= 0) return new Response(null, { status: 404 })
        const notes = await env.RELEASES.get(`releases/Codelume-${version}.txt`)
        if (!notes) return new Response(null, { status: 404 })
        if (notes.size > 64 * 1024) throw new Error('Release notes exceed 64 KiB')
        response = new Response(await notes.text(), { headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } })
      } else {
        response = Response.json({ releases: await releases(env.RELEASES) }, { headers })
      }
      return request.method === 'HEAD' ? new Response(null, response) : response
    } catch (error) {
      console.error('Release catalog unavailable', error)
      return Response.json({ error: 'Release catalog unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
  },
}
