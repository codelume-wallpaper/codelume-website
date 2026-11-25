import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowLeft, ArrowUpRight, ChevronDown, History, Info, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppWaveBackground } from '@/components/AppWaveBackground'
import { Footer } from '@/components/Footer'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ReleaseNotes } from '@/components/ReleaseNotes'
import { CODELUME_MAC_APP_STORE_URL } from '@/constants/externalLinks'
import { legalDocPath } from '@/constants/legalDocs'
import { formatReleaseSize, RELEASES_API, type Release } from '@/lib/releases'

function HistoricalRelease({ release }: { release: Release }) {
  const { t, i18n } = useTranslation('download')
  const [open, setOpen] = useState(false)
  return (
    <li className="border-t border-border first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`notes-${release.version}`} className="group flex min-h-11 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <ChevronDown size={16} aria-hidden="true" className={`shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-semibold">Codelume {release.version}</span>
            <span className="text-sm text-muted-foreground">{new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(release.publishedAt))} · {formatReleaseSize(release.size, i18n.language)}</span>
          </span>
          <span className="sr-only">{t('releaseNotes')}</span>
        </button>
        <a href={release.url} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" aria-label={t('downloadVersion', { version: release.version })}>
          <ArrowDownToLine size={15} aria-hidden="true" /> {t('downloadDmg')}
        </a>
      </div>
      <div id={`notes-${release.version}`} hidden={!open} className="pb-5 pl-7">
        {open && (release.hasNotes ? <ReleaseNotes version={release.version} /> : <p className="text-sm text-muted-foreground">{t('noNotes')}</p>)}
      </div>
    </li>
  )
}

export function DownloadPage() {
  const { t, i18n } = useTranslation(['hero', 'help', 'download'])
  const heading = useRef<HTMLHeadingElement>(null)
  const [releases, setReleases] = useState<Release[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const latest = releases?.[0]
  const history = releases?.slice(1) ?? []

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    heading.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    let active = true
    setFailed(false)
    fetch(RELEASES_API, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Release catalog unavailable')
        const data = await response.json()
        if (!Array.isArray(data.releases)) throw new Error('Invalid release catalog')
        if (active) setReleases(data.releases)
      })
      .catch(() => { if (active) setFailed(true) })
      .finally(() => window.clearTimeout(timeout))
    return () => { active = false; window.clearTimeout(timeout); controller.abort() }
  }, [attempt])

  return (
    <div className="relative isolate flex min-h-[100svh] flex-col bg-background text-foreground">
      <AppWaveBackground />
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium hover:text-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <ArrowLeft size={16} aria-hidden="true" /> {t('help:back')}
        </Link>
        <LanguageSwitcher variant="onSurface" />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-10 pt-3 sm:px-8 sm:pb-12 sm:pt-5">
        <div className="mb-6 flex items-center gap-4 sm:mb-8">
          <img src="/codelume-icon.svg" alt="" width="48" height="48" className="size-12 shrink-0" />
          <h1 ref={heading} tabIndex={-1} className="text-2xl font-semibold leading-snug tracking-tight outline-none sm:text-3xl">{t('hero:cta.download')}</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
          <article className="flex flex-col rounded-2xl border card-surface-peach p-6 text-[#302018] shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">{t('hero:cta.website')}</h2>
              {latest && <span className="rounded-full bg-[#fae3d3] px-3 py-1 text-sm font-medium text-[#834022]">{t('download:latest')}</span>}
            </div>
            <p className="mt-3 text-base leading-relaxed text-[#645247]">{t('hero:cta.websiteDescription')}</p>
            {latest && (
              <p className="mb-5 mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#645247]">
                <span className="font-semibold text-[#302018]">v{latest.version}</span>
                <time dateTime={latest.publishedAt}>{new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(latest.publishedAt))}</time>
                <span>{formatReleaseSize(latest.size, i18n.language)} · DMG</span>
              </p>
            )}
            <div className="mt-auto pt-3" aria-live="polite">
              {latest ? (
                <a href={latest.url} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#8d4125] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#73341e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                  <ArrowDownToLine size={17} aria-hidden="true" /> {t('download:downloadVersion', { version: latest.version })}
                </a>
              ) : failed ? (
                <div className="text-sm text-[#645247]">
                  <p>{t('download:loadError')}</p>
                  <button onClick={() => setAttempt(attempt + 1)} className="mt-2 min-h-11 rounded-full border border-[#d9b9a5] px-5 font-medium hover:bg-[#fae3d3] focus-visible:outline focus-visible:outline-2">{t('download:retry')}</button>
                </div>
              ) : <p className="min-h-12 text-sm text-[#645247]">{t(releases === null ? 'download:loading' : 'download:empty')}</p>}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#645247]">{t('download:universal')}</p>
          </article>

          <article className="flex flex-col rounded-2xl border card-surface-lavender p-6 text-[#221a31] shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <Store size={22} className="text-[#61359c]" aria-hidden="true" />
              <h2 className="text-xl font-semibold tracking-tight">{t('hero:cta.appStore')}</h2>
            </div>
            <p className="mb-6 mt-3 text-base leading-relaxed text-[#554962]">{t('hero:cta.appStoreDescription')}</p>
            <a href={CODELUME_MAC_APP_STORE_URL} target="_blank" rel="noreferrer" className="mt-auto inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-[#cfc0e4] md:mb-9 px-5 py-3 text-sm font-semibold text-[#61359c] transition-colors hover:bg-[#e7d9fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
              {t('hero:cta.openAppStore')} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
        </div>

        {latest && (
          <section aria-labelledby="release-notes" className="mt-6 rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-baseline gap-3">
              <h2 id="release-notes" className="text-lg font-semibold">{t('download:releaseNotes')}</h2>
              <span className="text-sm text-muted-foreground">v{latest.version}</span>
            </div>
            {latest.hasNotes ? <ReleaseNotes version={latest.version} /> : <p className="text-sm text-muted-foreground">{t('download:noNotes')}</p>}
          </section>
        )}

        {history.length > 0 && (
          <section className="mt-4 rounded-2xl border border-border bg-background px-6 sm:px-8">
            <h2>
              <button onClick={() => setShowHistory(!showHistory)} aria-expanded={showHistory} aria-controls="release-history" className="flex min-h-16 w-full items-center justify-between gap-3 rounded-lg py-4 text-left text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                <span className="inline-flex items-center gap-3"><History size={18} className="text-muted-foreground" aria-hidden="true" />{t('download:history')}</span>
                <ChevronDown size={18} aria-hidden="true" className={`shrink-0 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </button>
            </h2>
            <ul id="release-history" hidden={!showHistory} className="border-t border-border">{showHistory && history.map((release) => <HistoricalRelease key={release.version} release={release} />)}</ul>
          </section>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section aria-labelledby="download-system-requirements" className="rounded-2xl border border-border bg-background p-6 text-sm leading-relaxed">
            <h2 id="download-system-requirements" className="text-base font-semibold">{t('hero:cta.systemRequirements.title')}</h2>
            <p className="mt-3 text-sm text-foreground/75">{t('hero:cta.systemRequirements.description')}</p>
            <p className="mt-3 text-sm text-foreground/75">{t('hero:cta.websiteReason')}</p>
          </section>
          <section aria-labelledby="download-pro" className="rounded-2xl border border-border bg-background p-6 text-sm leading-relaxed">
            <h2 id="download-pro" className="text-base font-semibold">{t('hero:cta.pro.title')}</h2>
            <p className="mt-3 text-sm font-medium">{t('hero:cta.pro.price')}</p>
            <p className="mt-2 text-sm text-foreground/75">{t('hero:cta.pro.features')}</p>
            <p className="mt-2 text-sm text-foreground/75">{t('hero:cta.pro.purchase')}</p>
            <Link to={legalDocPath('refund')} className="mt-3 inline-block underline underline-offset-4">{t('common:refundPolicy')}</Link>
          </section>
        </div>
        <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{t('hero:cta.existingAccount')}</span>
        </p>
      </main>
      <Footer />
    </div>
  )
}
