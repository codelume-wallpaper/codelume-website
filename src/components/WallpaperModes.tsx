import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppleLogo } from './AppleLogo'
import { WallpaperDemoVideo } from './WallpaperDemoVideo'

import poster from '../assets/system-wallpapers/screensaver-poster.webp'
const nativeDemo = 'https://storage.codelume.cn/website/videos/b80fd1ba3837/screensaver-transition.mp4'
const codelumeDemo = 'https://storage.codelume.cn/website/videos/b80fd1ba3837/screensaver-continuous.mp4'

const modes = [
  { id: 'native', demo: nativeDemo },
  { id: 'codelume', demo: codelumeDemo },
] as const

function ModeDemo({ source, title }: { source: string; title: string }) {
  const { t } = useTranslation('portfolio')

  return (
    <figure className="mt-auto pt-4">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        <WallpaperDemoVideo src={source} poster={poster} label={title} />
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">{t('wallpaperModes.native.demo')}</figcaption>
    </figure>
  )
}

export function WallpaperModes() {
  const { t } = useTranslation('portfolio')

  return (
    <section aria-labelledby="wallpaper-modes-title" className="px-5 pt-14 sm:px-8 sm:pt-20 lg:px-12">
      <div id="wallpaper-modes" className="mx-auto max-w-6xl scroll-mt-28">
        <h2 id="wallpaper-modes-title" className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('wallpaperModes.title')}
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {modes.map(({ id, demo }) => (
            <article key={id} className={`flex min-w-0 flex-col rounded-3xl border p-5 text-card-foreground shadow-sm sm:p-7 ${id === 'native' ? 'card-surface-peach' : 'card-surface-lavender'}`}>
              <div className="flex items-center gap-3">
                {id === 'native' ? (
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#DCEAF7] text-[#234E73]">
                    <AppleLogo size={24} />
                  </span>
                ) : (
                  <img src="/codelume-icon.svg" alt="" width={44} height={44} className="size-11 shrink-0 rounded-xl" />
                )}
                <h3 className="text-xl font-semibold tracking-tight">{t(`wallpaperModes.${id}.title`)}</h3>
              </div>
              <ul className="mt-5 divide-y divide-border/70 border-y border-border/70">
                {([0, 1, 2] as const).map((index) => (
                  <li key={index} className="flex items-start gap-2.5 py-3 text-sm leading-relaxed text-muted-foreground">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent-purple" aria-hidden="true" />
                    {t(`wallpaperModes.${id}.points.${index}`)}
                  </li>
                ))}
              </ul>
              {id === 'native' && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t('wallpaperModes.native.availability')}</p>
              )}
              {demo && <ModeDemo source={demo} title={t(`wallpaperModes.${id}.title`)} />}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
