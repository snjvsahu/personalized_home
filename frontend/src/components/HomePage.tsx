import { useEffect, useState } from 'react'
import {
  HomeDecisionError,
  fetchHomeDecision,
  messageForDecisionError,
} from '../api/fetchHomeDecision'
import { HOME_DECISION_CONTRACT_VERSION } from '../types/homeDecision'
import { resolveInitialCustomerId } from '../previewCustomers'
import { errorNotice, missingCustomerNotice, type HomeNotice } from '../view/notices'
import { fallbackScreenModel, toScreenModel, type HomeScreenModel } from '../view/screenModel'
import { HomeScreen } from './HomeScreen'
import { LoadingState } from './LoadingState'
import { PersonaSwitcher } from './PersonaSwitcher'

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; model: HomeScreenModel }
  | { status: 'fallback'; model: HomeScreenModel; notice: HomeNotice }

type HomePageProps = {
  /**
   * Omit to read customerId from the query string.
   * Pass null to show the standard layout without calling the API.
   */
  customerId?: string | null
}

export function HomePage({ customerId }: HomePageProps) {
  const resolvedId = customerId !== undefined ? customerId : resolveInitialCustomerId()
  const [attempt, setAttempt] = useState(0)
  const requestKey = resolvedId ? `${resolvedId}:${attempt}` : null
  const [seenKey, setSeenKey] = useState(requestKey)
  const [page, setPage] = useState<PageState>(() =>
    requestKey ? { status: 'loading' } : fallbackPage('unknown', missingCustomerNotice()),
  )

  if (seenKey !== requestKey) {
    setSeenKey(requestKey)
    setPage(
      requestKey
        ? { status: 'loading' }
        : fallbackPage('unknown', missingCustomerNotice()),
    )
  }

  useEffect(() => {
    if (!resolvedId) return

    const controller = new AbortController()
    fetchHomeDecision(resolvedId, controller.signal)
      .then((decision) => {
        if (controller.signal.aborted) return
        setPage({ status: 'ready', model: toScreenModel(decision) })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (import.meta.env.DEV && error instanceof HomeDecisionError && error.reason) {
          console.warn(`[home-decision] ${error.reason}`)
        }
        setPage(fallbackPage(resolvedId, errorNotice(messageForDecisionError(error))))
      })

    return () => {
      controller.abort()
    }
  }, [resolvedId, attempt])

  useEffect(() => {
    if (page.status === 'ready' && page.model.customerName) {
      document.title = `Harborline · ${page.model.customerName}`
      return
    }
    document.title = 'Harborline self-care'
  }, [page])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="shell topbar-inner">
          <a className="wordmark" href="/">
            <SignalMark />
            Harborline
          </a>
          <p className="product-name">Self-care</p>
        </div>
      </header>
      <div className="shell scenarios-wrap">
        <PersonaSwitcher activeCustomerId={resolvedId} />
      </div>
      <main id="main" tabIndex={-1} className="shell main" aria-busy={page.status === 'loading'}>
        {page.status === 'loading' ? (
          <LoadingState />
        ) : (
          <HomeScreen
            model={page.model}
            notice={page.status === 'fallback' ? page.notice : undefined}
            onRetry={page.status === 'fallback' && resolvedId ? () => setAttempt((value) => value + 1) : undefined}
          />
        )}
      </main>
      <footer className="shell site-footer">
        <p>Harborline pilot · Home decision contract {HOME_DECISION_CONTRACT_VERSION}</p>
      </footer>
    </>
  )
}

function fallbackPage(customerId: string, notice: HomeNotice): PageState {
  return {
    status: 'fallback',
    model: fallbackScreenModel(customerId),
    notice,
  }
}

function SignalMark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="2" y="18" width="6" height="12" rx="1.5" />
      <rect x="13" y="12" width="6" height="18" rx="1.5" />
      <rect x="24" y="6" width="6" height="24" rx="1.5" />
    </svg>
  )
}
