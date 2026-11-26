import { useTranslation } from 'react-i18next'

const projects = [
  { name: 'Codelume' },
  { name: 'codelume-backend' },
  { name: 'codelume-skills' },
  { name: 'codelume-website', url: 'https://github.com/codelume-wallpaper/codelume-website' },
]

export function Community() {
  const { t } = useTranslation('portfolio')

  return (
    <section aria-labelledby="community-title" className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <div id="community" className="mx-auto max-w-6xl scroll-mt-28">
        <h2 id="community-title" className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('community.title')}
        </h2>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('community.openSourceDescription')}
        </p>

        <h3 className="mb-3 mt-8 text-base font-semibold">{t('community.projects')}</h3>
        <ul role="list" className="grid gap-3 md:grid-cols-2">
          {projects.map(({ name, url }, index) => (
            <li key={name} className={`min-w-0 rounded-2xl border p-5 shadow-sm sm:p-6 ${index % 2 === 0 ? 'card-surface-lavender' : 'card-surface-peach'}`}>
              <h4 className="break-words text-base font-semibold">{name}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(`community.descriptions.${name}`)}
              </p>
              <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t('community.sourceStatus')}</dt>
                <dd>
                  <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {url ? `${t('community.openSource')} · Apache-2.0` : t('community.closedSource')}
                  </span>
                </dd>
                <dt className="text-muted-foreground">{t('community.sourceAddress')}</dt>
                <dd className="text-muted-foreground">
                  {url ? (
                    <a href={url} className="text-foreground underline underline-offset-4">
                      GitHub
                    </a>
                  ) : t('community.sourceUnavailable')}
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
