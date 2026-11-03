import { useState, type MouseEvent } from 'react'
import type { HomeNotice } from '../view/notices'
import { formatUpdated, type HomeScreenModel } from '../view/screenModel'
import { BalanceSummary } from './BalanceSummary'
import { HeroBanner } from './HeroBanner'
import { OfferCard } from './OfferCard'
import { ShortcutGrid } from './ShortcutGrid'

type HomeScreenProps = {
  model: HomeScreenModel
  notice?: HomeNotice
  onRetry?: () => void
}

export function HomeScreen({ model, notice, onRetry }: HomeScreenProps) {
  const [pilotMessage, setPilotMessage] = useState<string | null>(null)
  const heading = model.customerName ? `Hello, ${model.customerName}` : 'Your home'

  function holdPilotNavigation(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const label = event.currentTarget.dataset.label ?? 'This page'
    setPilotMessage(`${label} isn't part of this pilot yet.`)
  }

  return (
    <article className="home" data-lob={model.lineOfBusiness} data-source={model.source}>
      {notice ? (
        <div
          className={notice.tone === 'error' ? 'banner banner-error' : 'banner banner-info'}
          role={notice.tone === 'error' ? 'alert' : 'note'}
        >
          <p className="banner-title">{notice.title}</p>
          <p>{notice.message}</p>
          {notice.tone === 'error' && onRetry ? (
            <button type="button" className="button button-danger" onClick={onRetry}>
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {model.example ? (
        <p className="example-flag" role="note">
          Example data. This customer is fictional and comes from the mock layer, not a live account.
        </p>
      ) : null}

      <header className="greeting">
        <p className="eyebrow">{model.serviceLabel}</p>
        <h1>{heading}</h1>
        <p className="updated">
          Updated <time dateTime={model.generatedAt}>{formatUpdated(model.generatedAt)}</time>
        </p>
      </header>

      <div className="slots">
        <HeroBanner hero={model.slots.hero} onActivate={holdPilotNavigation} />
        <BalanceSummary slot={model.slots.balance} />
        <ShortcutGrid slot={model.slots.shortcuts} onActivate={holdPilotNavigation} />
        {model.slots.offer ? (
          <OfferCard offer={model.slots.offer} onActivate={holdPilotNavigation} />
        ) : null}
      </div>

      {pilotMessage ? (
        <p className="pilot-status" role="status">
          {pilotMessage}
        </p>
      ) : null}
    </article>
  )
}
