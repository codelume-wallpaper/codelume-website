import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { selectReleaseNotes } from '../src/lib/releaseNotes.js'

const notes = 'Default notes\n\n--- translations ---\n\n[zh]\n简体\n\n第二段\n\n[zh-TW]\n繁體\n'

test('selects only the requested translation and preserves paragraphs', () => {
  assert.equal(selectReleaseNotes(notes.replaceAll('\n', '\r\n'), 'zh'), '简体\n\n第二段')
  assert.equal(selectReleaseNotes(notes, 'zh-TW'), '繁體')
})

test('uses the default for missing, empty or malformed translations', () => {
  for (const text of [notes, notes + '[de]\n', notes + '[de\nDeutsch', notes + '[de]\nA\n[de]\nB', notes + '--- translations ---\n[de]\nB']) {
    assert.equal(selectReleaseNotes(text, 'de'), 'Default notes')
  }
  assert.equal(selectReleaseNotes('旧版说明\n\n• 更新内容', 'en'), '旧版说明\n\n• 更新内容')
})

test('both release files contain a distinct complete section for every site language', () => {
  for (const [version, bullets] of [['6.0.1', 2], ['6.1.0', 9]]) {
    const text = readFileSync(new URL(`../docs/releases/Codelume-${version}.txt`, import.meta.url), 'utf8')
    assert.ok(Buffer.byteLength(text) <= 64 * 1024)
    const sections = ['en', 'zh', 'zh-TW', 'ja', 'ko', 'fr', 'de', 'es', 'pt-BR'].map(language => selectReleaseNotes(text, language))
    assert.equal(new Set(sections).size, sections.length)
    for (const section of sections) {
      assert.ok(section.split('\n')[0].includes(version))
      assert.equal(section.match(/^• /gm)?.length, bullets)
    }
  }
})
