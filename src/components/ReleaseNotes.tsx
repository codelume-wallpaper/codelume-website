import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RELEASES_API } from '@/lib/releases'

export function ReleaseNotes({ version }: { version: string }) {
  const { t } = useTranslation('download')
  const [notes, setNotes] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    let active = true
    setNotes(null)
    setFailed(false)
    fetch(`${RELEASES_API}?version=${encodeURIComponent(version)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Release notes unavailable')
        const text = await response.text()
        if (active) setNotes(text)
      })
      .catch(() => { if (active) setFailed(true) })
      .finally(() => window.clearTimeout(timeout))
    return () => { active = false; window.clearTimeout(timeout); controller.abort() }
  }, [version, attempt])

  if (failed) return (
    <p role="status" className="text-sm text-muted-foreground">
      {t('notesError')}{' '}
      <button onClick={() => setAttempt(attempt + 1)} className="rounded underline underline-offset-4 focus-visible:outline focus-visible:outline-2">{t('retry')}</button>
    </p>
  )
  if (notes === null) return <p role="status" className="text-sm text-muted-foreground">{t('loadingNotes')}</p>
  return <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/80">{notes.trim() || t('noNotes')}</p>
}
