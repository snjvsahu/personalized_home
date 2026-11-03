/**
 * EXAMPLE DATA
 * Fictional customers for the mock decision API. These are not live accounts.
 * Every payload sets example: true so the home screen can mark it.
 */
import { parseHomeDecision } from '../api/parseHomeDecision'
import { PREVIEW_CUSTOMERS } from '../previewCustomers'
import {
  HOME_DECISION_CONTRACT_VERSION,
  MAX_SHORTCUT_TILES,
  type HomeDecisionResponse,
} from '../types/homeDecision'

function definePersona(
  decision: HomeDecisionResponse & { example: true },
): HomeDecisionResponse {
  if (decision.slots.shortcuts.tiles.length > MAX_SHORTCUT_TILES) {
    throw new Error(
      `Example persona "${decision.customerId}" has more than ${MAX_SHORTCUT_TILES} shortcuts.`,
    )
  }
  return decision
}

export const MAYA_OKONKWO = definePersona({
  contractVersion: HOME_DECISION_CONTRACT_VERSION,
  customerId: 'maya-okonkwo',
  customerName: 'Maya Okonkwo',
  lineOfBusiness: 'prepaid',
  serviceLabel: 'Prepaid · 024 000 0198',
  generatedAt: '2026-10-12T08:30:00.000Z',
  example: true,
  slots: {
    hero: {
      id: 'maya-hero',
      eyebrow: 'For your weekend',
      title: 'A weekend bundle is ready',
      subtitle: '5 GB from Friday to Sunday, based on the last three recharges.',
      ctaLabel: 'See the bundle',
      ctaHref: '/bundles',
    },
    balance: {
      title: 'Balance and usage',
      items: [
        {
          id: 'maya-airtime',
          label: 'Airtime',
          displayValue: 'USD 4.20',
          hint: 'Runs out on Friday',
        },
        {
          id: 'maya-data',
          label: 'Data',
          displayValue: '0.8 GB',
          displayTotal: 'of 5 GB',
          percentRemaining: 16,
          hint: 'About a day at your usual pace',
        },
        {
          id: 'maya-validity',
          label: 'Validity',
          displayValue: '4 days',
          hint: 'Expires Friday',
        },
      ],
    },
    shortcuts: {
      title: 'Quick links',
      tiles: [
        { id: 'maya-recharge', label: 'Recharge', href: '/recharge', icon: 'recharge', badge: 'Low' },
        { id: 'maya-bundles', label: 'Bundles', href: '/bundles', icon: 'bundles' },
        { id: 'maya-transfer', label: 'Transfer', href: '/transfer', icon: 'transfer' },
        { id: 'maya-usage', label: 'Usage', href: '/usage', icon: 'usage' },
        { id: 'maya-sim', label: 'SIM', href: '/sim', icon: 'sim' },
        { id: 'maya-offers', label: 'Offers', href: '/offers', icon: 'offers' },
        { id: 'maya-help', label: 'Help', href: '/help', icon: 'help' },
        { id: 'maya-history', label: 'History', href: '/history', icon: 'history' },
      ],
    },
    offer: {
      id: 'maya-offer',
      kind: 'notification',
      title: 'Airtime is nearly gone',
      body: 'USD 4.20 is left on the line. It runs out on Friday unless you recharge.',
      ctaLabel: 'Recharge now',
      ctaHref: '/recharge',
    },
  },
})

export const ARUN_DESAI = definePersona({
  contractVersion: HOME_DECISION_CONTRACT_VERSION,
  customerId: 'arun-desai',
  customerName: 'Arun Desai',
  lineOfBusiness: 'postpaid',
  serviceLabel: 'Postpaid · 020 000 0144',
  generatedAt: '2026-10-12T08:05:00.000Z',
  example: true,
  slots: {
    hero: {
      id: 'arun-hero',
      eyebrow: 'This month',
      title: "October's bill is ready",
      subtitle: 'USD 86.40 is due on 18 October. 8 GB of the fair-use allowance is left.',
      ctaLabel: 'Review bill',
      ctaHref: '/bills',
    },
    balance: {
      title: 'Balance and usage',
      items: [
        {
          id: 'arun-due',
          label: 'Amount due',
          displayValue: 'USD 86.40',
          hint: 'Due 18 October',
        },
        {
          id: 'arun-data',
          label: 'Data left',
          displayValue: '8 GB',
          displayTotal: 'of 50 GB',
          percentRemaining: 16,
          hint: 'Fair-use allowance for this cycle',
        },
        {
          id: 'arun-voice',
          label: 'Voice',
          displayValue: 'Included',
          hint: 'Unlimited on-net',
        },
      ],
    },
    shortcuts: {
      title: 'Quick links',
      tiles: [
        { id: 'arun-bill', label: 'Pay bill', href: '/bills', icon: 'bill', badge: 'Due' },
        { id: 'arun-usage', label: 'Usage', href: '/usage', icon: 'usage' },
        { id: 'arun-plan', label: 'My plan', href: '/plan', icon: 'plan' },
        { id: 'arun-addons', label: 'Add-ons', href: '/add-ons', icon: 'add-on' },
        { id: 'arun-roaming', label: 'Roaming', href: '/roaming', icon: 'roaming' },
        { id: 'arun-esim', label: 'eSIM', href: '/esim', icon: 'esim' },
        { id: 'arun-help', label: 'Help', href: '/help', icon: 'help' },
        { id: 'arun-statements', label: 'Statements', href: '/statements', icon: 'statement' },
      ],
    },
    offer: {
      id: 'arun-offer',
      kind: 'next-best-offer',
      title: 'Unlimited 5G covers your overage',
      body: 'Extra data was billed twice this quarter. Unlimited 5G is USD 15 more than the current plan.',
      ctaLabel: 'Compare plans',
      ctaHref: '/plan',
    },
  },
})

export const LENA_BERG = definePersona({
  contractVersion: HOME_DECISION_CONTRACT_VERSION,
  customerId: 'lena-berg',
  customerName: 'Lena Berg',
  lineOfBusiness: 'broadband',
  serviceLabel: 'Broadband · Fibre HQ-0007',
  generatedAt: '2026-10-12T07:40:00.000Z',
  example: true,
  slots: {
    hero: {
      id: 'lena-hero',
      eyebrow: 'On your line',
      title: 'Fibre 300 looks healthy',
      subtitle: 'No open fault on this line. A short maintenance window is booked for Thursday.',
      ctaLabel: 'See the window',
      ctaHref: '/outages',
    },
    balance: {
      title: 'Balance and usage',
      items: [
        {
          id: 'lena-plan',
          label: 'Plan',
          displayValue: 'Fibre 300',
          hint: 'Download up to 300 Mbps',
        },
        {
          id: 'lena-used',
          label: 'Used this month',
          displayValue: '812 GB',
          hint: 'No fair-use cap on this plan',
        },
        {
          id: 'lena-bill',
          label: 'Next bill',
          displayValue: '12 November',
          hint: 'USD 62.00 estimated',
        },
      ],
    },
    shortcuts: {
      title: 'Quick links',
      tiles: [
        { id: 'lena-speed', label: 'Speed test', href: '/speed', icon: 'speed' },
        { id: 'lena-wifi', label: 'Wi-Fi', href: '/wifi', icon: 'wifi' },
        { id: 'lena-bill', label: 'Pay bill', href: '/bills', icon: 'bill' },
        { id: 'lena-outages', label: 'Outages', href: '/outages', icon: 'outage', badge: 'Thu' },
        { id: 'lena-devices', label: 'Devices', href: '/devices', icon: 'devices' },
        { id: 'lena-upgrade', label: 'Upgrade', href: '/upgrade', icon: 'upgrade' },
        { id: 'lena-help', label: 'Help', href: '/help', icon: 'help' },
        { id: 'lena-move', label: 'Move service', href: '/move', icon: 'move' },
      ],
    },
    offer: {
      id: 'lena-offer',
      kind: 'notification',
      title: 'Maintenance Thursday 02:00-04:00',
      body: 'Home fibre may drop for a few minutes. Mobile data keeps Wi-Fi calling up.',
      ctaLabel: 'Outage details',
      ctaHref: '/outages',
    },
  },
})

/** EXAMPLE DATA keyed by customerId. Unknown ids are not in this map. */
export const EXAMPLE_PERSONAS: Record<string, HomeDecisionResponse> = {
  [MAYA_OKONKWO.customerId]: MAYA_OKONKWO,
  [ARUN_DESAI.customerId]: ARUN_DESAI,
  [LENA_BERG.customerId]: LENA_BERG,
}

function assertExampleDataIsValid(): void {
  for (const [id, persona] of Object.entries(EXAMPLE_PERSONAS)) {
    if (persona.customerId !== id) {
      throw new Error(`Example persona key "${id}" does not match customerId "${persona.customerId}".`)
    }
    if (persona.example !== true) {
      throw new Error(`Example persona "${id}" must set example: true.`)
    }
    const parsed = parseHomeDecision(persona)
    if (!parsed.ok) {
      throw new Error(`Example persona "${id}" does not match the contract: ${parsed.reason}`)
    }
  }

  for (const scenario of PREVIEW_CUSTOMERS) {
    if (scenario.expects === 'persona' && !EXAMPLE_PERSONAS[scenario.id]) {
      throw new Error(`Example scenario "${scenario.id}" is missing a persona.`)
    }
  }
}

if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  assertExampleDataIsValid()
}
