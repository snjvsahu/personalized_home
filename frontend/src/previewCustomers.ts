export const DEFAULT_EXAMPLE_CUSTOMER_ID = 'maya-okonkwo'

export const PREVIEW_CUSTOMERS = [
  { id: 'maya-okonkwo', label: 'Maya · Prepaid', expects: 'persona' },
  { id: 'arun-desai', label: 'Arun · Postpaid', expects: 'persona' },
  { id: 'lena-berg', label: 'Lena · Broadband', expects: 'persona' },
  { id: 'no-such-customer', label: 'Unknown customer', expects: 'error' },
  { id: 'service-outage', label: 'Service outage', expects: 'error' },
] as const

export function readCustomerId(search = window.location.search): string | null {
  const value = new URLSearchParams(search).get('customerId')?.trim()
  return value ? value : null
}

/**
 * Production builds only call the API when customerId is present.
 * The dev server opens on the prepaid example so the pilot is not a blank page.
 */
export function resolveInitialCustomerId(): string | null {
  const fromQuery = readCustomerId()
  if (fromQuery) return fromQuery
  if (import.meta.env.DEV) return DEFAULT_EXAMPLE_CUSTOMER_ID
  return null
}

export function scenarioHref(customerId: string): string {
  return `/?${new URLSearchParams({ customerId }).toString()}`
}
