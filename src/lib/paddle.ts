type PaddleEvent = { name: string }
type EventHandler = (event: PaddleEvent) => void

type PaddleClient = {
  Initialized: boolean
  Environment: { set: (environment: 'sandbox') => void }
  Initialize: (options: { token: string; eventCallback?: EventHandler }) => void
  Update: (options: { eventCallback: EventHandler }) => void
  Checkout: { open: (options: { transactionId: string }) => void; close: () => void }
  PricePreview: (options: {
    items: { priceId: string; quantity: number }[]
    address: { countryCode: string }
    currencyCode: string
  }) => Promise<{ data: { details: { lineItems: { formattedTotals: { total: string } }[] } } }>
}
declare global { interface Window { Paddle?: PaddleClient } }

let loading: Promise<PaddleClient> | undefined

export function loadPaddle(): Promise<PaddleClient> {
  if (window.Paddle) return Promise.resolve(window.Paddle)
  loading ??= new Promise<PaddleClient>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    const fail = () => { script.remove(); reject(new Error('Paddle unavailable')) }
    script.onload = () => window.Paddle ? resolve(window.Paddle) : fail()
    script.onerror = fail
    document.head.appendChild(script)
  }).catch(error => { loading = undefined; throw error })
  return loading
}

// A first initialization on /checkout automatically opens its _ptxn transaction.
export function initializePaddle(paddle: PaddleClient, eventCallback?: EventHandler): boolean {
  if (paddle.Initialized) {
    if (eventCallback) paddle.Update({ eventCallback })
    return false
  }
  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN
  const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT
  const pattern = environment === 'sandbox' ? /^test_[a-zA-Z0-9_]+$/ : /^live_[a-zA-Z0-9_]+$/
  if (!['sandbox', 'live'].includes(environment) || !pattern.test(token ?? '')) throw new Error('Invalid Paddle configuration')
  if (environment === 'sandbox') paddle.Environment.set('sandbox')
  paddle.Initialize({ token, eventCallback })
  return true
}
