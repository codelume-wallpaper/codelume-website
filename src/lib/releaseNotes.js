// The text before the translation marker also serves as the single-language format.
export function selectReleaseNotes(text, language) {
  const [original, translations, ...extra] = text.replace(/\r\n?/g, '\n').split(/^--- translations ---[ \t]*$/m)
  const fallback = original.trim()
  if (!translations || extra.length) return fallback

  const sections = new Map()
  let lines
  for (const line of translations.trim().split('\n')) {
    if (line.trimStart().startsWith('[')) {
      const header = /^\[([a-z]{2,3}(?:-[a-z0-9]{2,8})*)\]$/i.exec(line.trim())
      if (!header) return fallback
      const key = header[1].toLowerCase()
      if (sections.has(key)) return fallback
      lines = []
      sections.set(key, lines)
    } else if (lines) {
      lines.push(line)
    } else {
      return fallback
    }
  }
  return sections.get(language.toLowerCase())?.join('\n').trim() || fallback
}
