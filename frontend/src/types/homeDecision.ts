/**
 * Wire contract for GET /api/home/decision.
 * This file is the source of truth for the pilot. The narrative version is
 * frontend/docs/api-contract.md. Backend code should match these types.
 */

export const HOME_DECISION_CONTRACT_VERSION = '1.0' as const

/** The client renders at most this many shortcut tiles, in payload order. */
export const MAX_SHORTCUT_TILES = 8

export type HomeDecisionContractVersion = typeof HOME_DECISION_CONTRACT_VERSION

export type LineOfBusiness = 'prepaid' | 'postpaid' | 'broadband'

/**
 * Icon names the home screen knows how to draw. Any other string still
 * renders, using a generic mark, so a new icon does not blank the tile.
 */
export const RECOMMENDED_SHORTCUT_ICONS = [
  'recharge',
  'bundles',
  'transfer',
  'usage',
  'sim',
  'offers',
  'help',
  'history',
  'bill',
  'plan',
  'add-on',
  'roaming',
  'esim',
  'statement',
  'speed',
  'wifi',
  'outage',
  'devices',
  'upgrade',
  'move',
  'account',
] as const

export type OfferKind = 'notification' | 'next-best-offer'

export interface HeroSlot {
  id: string
  /** Short kicker above the title, for example "For your weekend". */
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel?: string
  /** Site path ("/bundles") or absolute http(s) URL. */
  ctaHref?: string
  /** Site path or absolute http(s) URL. Requires imageAlt. */
  imageUrl?: string
  imageAlt?: string
}

export interface ShortcutTile {
  id: string
  label: string
  /** Site path ("/recharge") or absolute http(s) URL. */
  href: string
  /** Prefer a name from RECOMMENDED_SHORTCUT_ICONS. */
  icon: string
  /** Short status such as "Due" or "Low". */
  badge?: string
}

export interface ShortcutsSlot {
  title: string
  /**
   * Chosen by the decision service for this line of business.
   * Send at most MAX_SHORTCUT_TILES. The client keeps the first 8.
   */
  tiles: ShortcutTile[]
}

export interface OfferSlot {
  id: string
  kind: OfferKind
  title: string
  body: string
  ctaLabel?: string
  ctaHref?: string
}

export interface BalanceItem {
  id: string
  label: string
  /** Already localized by the decision service, for example "USD 4.20" or "0.8 GB". */
  displayValue: string
  /** Secondary figure, for example "of 5 GB". */
  displayTotal?: string
  hint?: string
  /**
   * Remaining share from 0 to 100. Omit the field when the row is not a meter.
   * The client clamps out-of-range numbers.
   */
  percentRemaining?: number
}

export interface BalanceSlot {
  title: string
  items: BalanceItem[]
}

export interface HomeSlots {
  hero: HeroSlot
  shortcuts: ShortcutsSlot
  /** Required key. Null means the decision intentionally has no card. */
  offer: OfferSlot | null
  balance: BalanceSlot
}

export interface HomeDecisionResponse {
  contractVersion: HomeDecisionContractVersion
  customerId: string
  /** Full name used in the greeting. The client does not look the customer up. */
  customerName: string
  lineOfBusiness: LineOfBusiness
  /** Already masked line description, for example "Prepaid · 024 000 0198". */
  serviceLabel: string
  /** ISO-8601 timestamp. */
  generatedAt: string
  /**
   * True only for synthetic payloads from the mock layer.
   * Production responses omit this or set it to false.
   */
  example?: boolean
  slots: HomeSlots
}

export type HomeDecisionErrorCode =
  | 'customer_id_required'
  | 'customer_not_found'
  | 'decision_unavailable'

export interface HomeDecisionErrorBody {
  error: HomeDecisionErrorCode
  message: string
}
