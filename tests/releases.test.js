import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../public/_worker.js'

const object = (key, size = 1024) => ({ key, size, uploaded: new Date('2026-11-25T12:00:00Z') })
const request = (query = '') => new Request(`https://codelume.cn/api/releases${query}`)

test('finds stable installers across pages and orders versions numerically, ignoring draft files', async () => {
  const calls = []
  const RELEASES = { async list(options) {
    calls.push(options)
    return options.cursor ? { objects: [object('releases/Codelume-6.10.0.dmg'), object('releases/Codelume-6.10.0.txt')], truncated: false } : {
      objects: ['6.9.0', '6.1.9', '6.1.10', '6.11.0-beta'].map((v) => object(`releases/Codelume-${v}.dmg`)).concat([
        object('releases/Codelume-99.0.0-preview.dmg'), object('releases/private/Codelume-99.0.0.dmg'),
        object('releases/Codelume-88.0.0.dmg', 0), object('releases/Codelume-01.0.0.dmg'),
      ]), truncated: true, cursor: 'next',
    }
  } }
  const response = await worker.fetch(request(), { RELEASES })
  assert.equal(response.status, 200)
  const { releases } = await response.json()
  assert.deepEqual(releases.map((r) => r.version), ['6.10.0', '6.9.0', '6.1.10', '6.1.9'])
  assert.equal(releases[0].url, 'https://storage.codelume.cn/releases/Codelume-6.10.0.dmg')
  assert.equal(releases[0].hasNotes, true)
  assert.equal(releases[1].hasNotes, false)
  assert.equal(calls[1].cursor, 'next')
  assert.equal(calls[0].prefix, 'releases/')
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60, s-maxage=60')
})

test('serves text notes only for a published installer and validates version input', async () => {
  const keys = []
  const RELEASES = {
    head: async (key) => { keys.push(key); return key.endsWith('6.1.0.dmg') ? object(key) : null },
    get: async (key) => { keys.push(key); return { size: 10, text: async () => '<script>plain text</script>' } },
  }
  const response = await worker.fetch(request('?version=6.1.0'), { RELEASES })
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8')
  assert.equal(await response.text(), '<script>plain text</script>')
  assert.deepEqual(keys, ['releases/Codelume-6.1.0.dmg', 'releases/Codelume-6.1.0.txt'])
  assert.equal((await worker.fetch(request('?version=../private'), { RELEASES })).status, 400)
  assert.equal((await worker.fetch(request('?version=7.0.0'), { RELEASES })).status, 404)
  RELEASES.get = async () => null
  assert.equal((await worker.fetch(request('?version=6.1.0'), { RELEASES })).status, 404)
})

test('handles empty catalogs, HEAD, unsupported methods, and static routes', async () => {
  const RELEASES = { list: async () => ({ objects: [], truncated: false }) }
  assert.deepEqual(await (await worker.fetch(request(), { RELEASES })).json(), { releases: [] })
  const head = await worker.fetch(new Request(request(), { method: 'HEAD' }), { RELEASES })
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
  assert.equal((await worker.fetch(new Request(request(), { method: 'POST' }), {})).status, 405)
  const response = await worker.fetch(new Request('https://codelume.cn/download'), { ASSETS: { fetch: () => new Response('page') } })
  assert.equal(await response.text(), 'page')
})

test('returns a retryable response without exposing storage errors', async () => {
  const original = console.error
  console.error = () => {}
  try {
    const response = await worker.fetch(request(), { RELEASES: { list: () => { throw new Error('private details') } } })
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.doesNotMatch(await response.text(), /private details/)
  } finally { console.error = original }
})
