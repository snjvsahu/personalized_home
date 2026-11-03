import { useId, type MouseEvent } from 'react'
import type { OfferSlot } from '../types/homeDecision'

const OFFER_KIND_LABEL = {
  notification: 'Notification',
  'next-best-offer': 'Next best offer',
} as const

type OfferCardProps = {
  offer: OfferSlot
  onActivate: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function OfferCard({ offer, onActivate }: OfferCardProps) {
  const headingId = useId()

  return (
    <section className="card offer" data-kind={offer.kind} aria-labelledby={headingId}>
      <p className="kicker">{OFFER_KIND_LABEL[offer.kind]}</p>
      <h2 id={headingId}>{offer.title}</h2>
      <p className="offer-body">{offer.body}</p>
      {offer.ctaLabel && offer.ctaHref ? (
        <a
          className="button button-solid"
          href={offer.ctaHref}
          data-label={offer.ctaLabel}
          onClick={onActivate}
        >
          {offer.ctaLabel}
        </a>
      ) : null}
    </section>
  )
}
