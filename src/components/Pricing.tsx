import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { normalizeLanguage, type SupportedLanguage } from '../i18n/config'
import { initializePaddle, loadPaddle } from '../lib/paddle'

const markets = {
  zh: ['CN', 'CNY'], 'zh-TW': ['TW', 'TWD'], en: ['US', 'USD'],
  ja: ['JP', 'JPY'], ko: ['KR', 'KRW'], fr: ['FR', 'EUR'],
  de: ['DE', 'EUR'], es: ['ES', 'EUR'], 'pt-BR': ['BR', 'BRL'],
} as const satisfies Record<SupportedLanguage, readonly [string, string]>

export function Pricing() {
  const { t, i18n } = useTranslation('portfolio')
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  const [countryCode, currencyCode] = markets[language as SupportedLanguage] ?? markets.en
  const [quote, setQuote] = useState<{ country: string; total: string }>()
  const price = quote?.country === countryCode ? quote.total : undefined

  useEffect(() => {
    const priceId = import.meta.env.VITE_PADDLE_PRO_PRICE_ID
    if (!priceId || new URLSearchParams(window.location.search).has('_ptxn')) return
    let active = true
    async function preview() {
      const paddle = await loadPaddle()
      if (!active) return
      initializePaddle(paddle)
      const result = await paddle.PricePreview({
        items: [{ priceId, quantity: 1 }],
        address: { countryCode },
        currencyCode,
      })
      const total = result.data.details.lineItems[0]?.formattedTotals.total
      if (active && total) setQuote({ country: countryCode, total })
    }
    preview().catch(() => { if (active) setQuote(undefined) })
    return () => { active = false }
  }, [countryCode, currencyCode])

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-28 px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 id="pricing-title" className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('pricing.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(['standard', 'pro'] as const).map(plan => (
            <article key={plan} className={`min-w-0 rounded-3xl border p-6 text-[#332b2c] sm:p-8 ${plan === 'pro' ? 'card-surface-lavender' : 'card-surface-peach'}`}>
              <h3 className="text-lg font-semibold">{t(`pricing.${plan}.title`)}</h3>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <strong className="text-3xl font-semibold tracking-tight">{plan === 'pro' ? price ?? t('pricing.pro.billing') : t('pricing.standard.price')}</strong>
                {plan === 'pro' && price && <span className="text-sm">{t('pricing.pro.billing')}</span>}
              </p>
              <p className="mt-4 leading-relaxed">{t(`pricing.${plan}.description`)}</p>
              {plan === 'pro' && (
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>{t('pricing.pro.checkoutNote')}</p>
                  <p>{t('pricing.support')}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
