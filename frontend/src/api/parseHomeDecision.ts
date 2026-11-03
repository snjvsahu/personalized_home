import {
  HOME_DECISION_CONTRACT_VERSION,
  type BalanceItem,
  type BalanceSlot,
  type HeroSlot,
  type HomeDecisionResponse,
  type LineOfBusiness,
  type OfferKind,
  type OfferSlot,
  type ShortcutTile,
  type ShortcutsSlot,
} from '../types/homeDecision'

export type ParseResult =
  | { ok: true; value: HomeDecisionResponse }
  | { ok: false; reason: string }

const LINES_OF_BUSINESS = new Set<LineOfBusiness>(['prepaid', 'postpaid', 'broadband'])
const OFFER_KINDS = new Set<OfferKind>(['notification', 'next-best-offer'])

export function parseHomeDecision(input: unknown): ParseResult {
  if (!isRecord(input)) return fail('Response must be a JSON object.')
  if (input.contractVersion !== HOME_DECISION_CONTRACT_VERSION) {
    return fail('contractVersion must be "1.0".')
  }

  const customerId = requiredString(input.customerId)
  const customerName = requiredString(input.customerName)
  const serviceLabel = requiredString(input.serviceLabel)
  const generatedAt = requiredString(input.generatedAt)
  if (!customerId || !customerName || !serviceLabel || !generatedAt) {
    return fail('customerId, customerName, serviceLabel, and generatedAt must be non-empty strings.')
  }
  if (Number.isNaN(Date.parse(generatedAt))) {
    return fail('generatedAt must be an ISO-8601 date string.')
  }
  if (!isLineOfBusiness(input.lineOfBusiness)) {
    return fail('lineOfBusiness must be prepaid, postpaid, or broadband.')
  }

  let example: boolean | undefined
  if ('example' in input) {
    if (typeof input.example !== 'boolean') return fail('example must be a boolean when present.')
    example = input.example
  }

  if (!isRecord(input.slots)) return fail('slots must be an object.')
  const hero = parseHero(input.slots.hero)
  if (!hero.ok) return hero
  const shortcuts = parseShortcuts(input.slots.shortcuts)
  if (!shortcuts.ok) return shortcuts
  const balance = parseBalance(input.slots.balance)
  if (!balance.ok) return balance
  if (!('offer' in input.slots)) {
    return fail('slots.offer is required. Use null when there is no card.')
  }
  const offer = parseOffer(input.slots.offer)
  if (!offer.ok) return offer

  const value: HomeDecisionResponse = {
    contractVersion: HOME_DECISION_CONTRACT_VERSION,
    customerId,
    customerName,
    serviceLabel,
    generatedAt,
    lineOfBusiness: input.lineOfBusiness,
    slots: {
      hero: hero.value,
      shortcuts: shortcuts.value,
      balance: balance.value,
      offer: offer.value,
    },
  }
  if (example !== undefined) value.example = example
  return { ok: true, value }
}

function parseHero(input: unknown): Parsed<HeroSlot> {
  if (!isRecord(input)) return fail('slots.hero must be an object.')
  const id = requiredString(input.id)
  const title = requiredString(input.title)
  const subtitle = requiredString(input.subtitle)
  if (!id || !title || !subtitle) {
    return fail('slots.hero needs id, title, and subtitle.')
  }

  const eyebrow = readOptionalString(input, 'eyebrow', 'slots.hero.eyebrow')
  if (!eyebrow.ok) return eyebrow
  const cta = readCta(input, 'slots.hero')
  if (!cta.ok) return cta
  const image = readImage(input, 'slots.hero')
  if (!image.ok) return image

  return {
    ok: true,
    value: {
      id,
      title,
      subtitle,
      ...spreadDefined({ eyebrow: eyebrow.value }),
      ...cta.value,
      ...image.value,
    },
  }
}

function parseShortcuts(input: unknown): Parsed<ShortcutsSlot> {
  if (!isRecord(input)) return fail('slots.shortcuts must be an object.')
  const title = requiredString(input.title)
  if (!title) return fail('slots.shortcuts.title must be a non-empty string.')
  if (!Array.isArray(input.tiles)) return fail('slots.shortcuts.tiles must be an array.')

  const tiles: ShortcutTile[] = []
  for (let index = 0; index < input.tiles.length; index += 1) {
    const tile = parseTile(input.tiles[index], index)
    if (!tile.ok) return tile
    tiles.push(tile.value)
  }
  return { ok: true, value: { title, tiles } }
}

function parseTile(input: unknown, index: number): Parsed<ShortcutTile> {
  const label = `slots.shortcuts.tiles[${index}]`
  if (!isRecord(input)) return fail(`${label} must be an object.`)
  const id = requiredString(input.id)
  const tileLabel = requiredString(input.label)
  const href = requiredString(input.href)
  const icon = requiredString(input.icon)
  if (!id || !tileLabel || !href || !icon) {
    return fail(`${label} needs id, label, href, and icon.`)
  }
  if (!isSafeHref(href)) {
    return fail(`${label}.href must be a site path or an http(s) URL.`)
  }

  const tile: ShortcutTile = { id, label: tileLabel, href, icon }
  if ('badge' in input && input.badge != null) {
    const badge = requiredString(input.badge)
    if (!badge) return fail(`${label}.badge must be a non-empty string when present.`)
    tile.badge = badge
  }
  return { ok: true, value: tile }
}

function parseOffer(input: unknown): Parsed<OfferSlot | null> {
  if (input === null) return { ok: true, value: null }
  if (!isRecord(input)) return fail('slots.offer must be an object or null.')
  const id = requiredString(input.id)
  const title = requiredString(input.title)
  const body = requiredString(input.body)
  if (!id || !title || !body) return fail('slots.offer needs id, title, and body.')
  if (!isOfferKind(input.kind)) {
    return fail('slots.offer.kind must be notification or next-best-offer.')
  }
  const cta = readCta(input, 'slots.offer')
  if (!cta.ok) return cta
  return { ok: true, value: { id, kind: input.kind, title, body, ...cta.value } }
}

function parseBalance(input: unknown): Parsed<BalanceSlot> {
  if (!isRecord(input)) return fail('slots.balance must be an object.')
  const title = requiredString(input.title)
  if (!title) return fail('slots.balance.title must be a non-empty string.')
  if (!Array.isArray(input.items)) return fail('slots.balance.items must be an array.')

  const items: BalanceItem[] = []
  for (let index = 0; index < input.items.length; index += 1) {
    const item = parseBalanceItem(input.items[index], index)
    if (!item.ok) return item
    items.push(item.value)
  }
  return { ok: true, value: { title, items } }
}

function parseBalanceItem(input: unknown, index: number): Parsed<BalanceItem> {
  const label = `slots.balance.items[${index}]`
  if (!isRecord(input)) return fail(`${label} must be an object.`)
  const id = requiredString(input.id)
  const itemLabel = requiredString(input.label)
  const displayValue = requiredString(input.displayValue)
  if (!id || !itemLabel || !displayValue) {
    return fail(`${label} needs id, label, and displayValue.`)
  }

  const displayTotal = readOptionalString(input, 'displayTotal', `${label}.displayTotal`)
  if (!displayTotal.ok) return displayTotal
  const hint = readOptionalString(input, 'hint', `${label}.hint`)
  if (!hint.ok) return hint

  const item: BalanceItem = { id, label: itemLabel, displayValue }
  if (displayTotal.value) item.displayTotal = displayTotal.value
  if (hint.value) item.hint = hint.value

  if ('percentRemaining' in input && input.percentRemaining != null) {
    if (typeof input.percentRemaining !== 'number' || !Number.isFinite(input.percentRemaining)) {
      return fail(`${label}.percentRemaining must be a finite number.`)
    }
    item.percentRemaining = clampPercent(input.percentRemaining)
  }
  return { ok: true, value: item }
}

function readCta(
  record: Record<string, unknown>,
  prefix: string,
): Parsed<{ ctaLabel?: string; ctaHref?: string }> {
  const hasLabel = 'ctaLabel' in record && record.ctaLabel != null
  const hasHref = 'ctaHref' in record && record.ctaHref != null
  if (!hasLabel && !hasHref) return { ok: true, value: {} }
  const ctaLabel = requiredString(record.ctaLabel)
  const ctaHref = requiredString(record.ctaHref)
  if (!ctaLabel || !ctaHref) {
    return fail(`${prefix} CTA needs both ctaLabel and ctaHref.`)
  }
  if (!isSafeHref(ctaHref)) {
    return fail(`${prefix}.ctaHref must be a site path or an http(s) URL.`)
  }
  return { ok: true, value: { ctaLabel, ctaHref } }
}

function readImage(
  record: Record<string, unknown>,
  prefix: string,
): Parsed<{ imageUrl?: string; imageAlt?: string }> {
  const hasUrl = 'imageUrl' in record && record.imageUrl != null
  const hasAlt = 'imageAlt' in record && record.imageAlt != null
  if (!hasUrl && !hasAlt) return { ok: true, value: {} }
  const imageUrl = requiredString(record.imageUrl)
  const imageAlt = requiredString(record.imageAlt)
  if (!imageUrl || !imageAlt) {
    return fail(`${prefix} image needs both imageUrl and imageAlt.`)
  }
  if (!isSafeHref(imageUrl)) {
    return fail(`${prefix}.imageUrl must be a site path or an http(s) URL.`)
  }
  return { ok: true, value: { imageUrl, imageAlt } }
}

function readOptionalString(
  record: Record<string, unknown>,
  key: string,
  field: string,
): Parsed<string | undefined> {
  if (!(key in record) || record[key] == null) return { ok: true, value: undefined }
  const value = requiredString(record[key])
  if (!value) return fail(`${field} must be a non-empty string when present.`)
  return { ok: true, value }
}

function spreadDefined<T extends Record<string, string | undefined>>(fields: T): Partial<T> {
  const defined: Partial<T> = {}
  for (const key of Object.keys(fields) as Array<keyof T>) {
    if (fields[key] !== undefined) defined[key] = fields[key]
  }
  return defined
}

function isSafeHref(href: string): boolean {
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('\\')) return true
  try {
    const url = new URL(href)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function isLineOfBusiness(value: unknown): value is LineOfBusiness {
  return typeof value === 'string' && LINES_OF_BUSINESS.has(value as LineOfBusiness)
}

function isOfferKind(value: unknown): value is OfferKind {
  return typeof value === 'string' && OFFER_KINDS.has(value as OfferKind)
}

function requiredString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(reason: string): { ok: false; reason: string } {
  return { ok: false, reason }
}

type Parsed<T> = { ok: true; value: T } | { ok: false; reason: string }
