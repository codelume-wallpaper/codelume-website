export interface Release {
  version: string
  url: string
  size: number
  publishedAt: string
  hasNotes: boolean
}

export const RELEASES_API = '/api/releases'

export function formatReleaseSize(size: number, language: string) {
  return `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(size / 1_000_000)} MB`
}
