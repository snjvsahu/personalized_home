import { useId, type MouseEvent } from 'react'
import type { HeroSlot } from '../types/homeDecision'

type HeroBannerProps = {
  hero: HeroSlot
  onActivate: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function HeroBanner({ hero, onActivate }: HeroBannerProps) {
  const headingId = useId()

  return (
    <section className="hero" aria-labelledby={headingId}>
      <div className="hero-copy">
        {hero.eyebrow ? <p className="eyebrow">{hero.eyebrow}</p> : null}
        <h2 id={headingId}>{hero.title}</h2>
        <p className="hero-subtitle">{hero.subtitle}</p>
        {hero.ctaLabel && hero.ctaHref ? (
          <a
            className="button button-inverse"
            href={hero.ctaHref}
            data-label={hero.ctaLabel}
            onClick={onActivate}
          >
            {hero.ctaLabel}
          </a>
        ) : null}
      </div>
      {hero.imageUrl ? (
        <img className="hero-image" src={hero.imageUrl} alt={hero.imageAlt ?? ''} />
      ) : null}
    </section>
  )
}
