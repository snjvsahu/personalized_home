import {
  MAX_SHORTCUT_TILES,
  type HomeDecisionResponse,
  type HomeSlots,
  type LineOfBusiness,
} from '../types/homeDecision'

export type HomeScreenModel = {
  source: 'decision' | 'fallback'
  customerId: string
  customerName?: string
  serviceLabel: string
  lineOfBusiness: LineOfBusiness | 'unknown'
  generatedAt: string
  example: boolean
  slots: HomeSlots
}

export function toScreenModel(decision: HomeDecisionResponse): HomeScreenModel {
  return {
    source: 'decision',
    customerId: decision.customerId,
    customerName: decision.customerName,
    serviceLabel: decision.serviceLabel,
    lineOfBusiness: decision.lineOfBusiness,
    generatedAt: decision.generatedAt,
    example: decision.example === true,
    slots: {
      ...decision.slots,
      shortcuts: {
        ...decision.slots.shortcuts,
        tiles: decision.slots.shortcuts.tiles.slice(0, MAX_SHORTCUT_TILES),
      },
    },
  }
}

/** Client-owned layout used when the decision API cannot be used. */
export function fallbackScreenModel(customerId: string): HomeScreenModel {
  return {
    source: 'fallback',
    customerId,
    serviceLabel: 'Standard layout',
    lineOfBusiness: 'unknown',
    generatedAt: new Date().toISOString(),
    example: false,
    slots: {
      hero: {
        id: 'fallback-hero',
        eyebrow: 'Standard home',
        title: 'Welcome back',
        subtitle: 'Personalization is unavailable, so this is the standard home for any line.',
        ctaLabel: 'Contact support',
        ctaHref: '/help',
      },
      balance: {
        title: 'Balance and usage',
        items: [
          {
            id: 'fallback-balance',
            label: 'Account balances',
            displayValue: 'Unavailable',
            hint: 'Balances appear when your account responds.',
          },
        ],
      },
      shortcuts: {
        title: 'Quick links',
        tiles: [
          { id: 'fallback-bills', label: 'Bills and payments', href: '/bills', icon: 'bill' },
          { id: 'fallback-usage', label: 'Usage', href: '/usage', icon: 'usage' },
          { id: 'fallback-help', label: 'Help', href: '/help', icon: 'help' },
          { id: 'fallback-account', label: 'Account', href: '/account', icon: 'account' },
        ],
      },
      offer: {
        id: 'fallback-offer',
        kind: 'notification',
        title: "We're here if you need a hand",
        body: 'Support can look up the line while personalized offers are offline.',
        ctaLabel: 'Contact support',
        ctaHref: '/help',
      },
    },
  }
}

export function formatUpdated(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
