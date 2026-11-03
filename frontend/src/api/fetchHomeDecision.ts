import { parseHomeDecision } from './parseHomeDecision'
import type { HomeDecisionResponse } from '../types/homeDecision'

const DECISION_TIMEOUT_MS = 8_000

export type HomeDecisionFailureCode =
  | 'bad_request'
  | 'not_found'
  | 'unavailable'
  | 'invalid_response'

export class HomeDecisionError extends Error {
  readonly code: HomeDecisionFailureCode
  readonly reason: string | undefined

  constructor(code: HomeDecisionFailureCode, reason?: string) {
    super(reason ?? code)
    this.name = 'HomeDecisionError'
    this.code = code
    this.reason = reason
  }
}

export async function fetchHomeDecision(
  customerId: string,
  callerSignal?: AbortSignal,
): Promise<HomeDecisionResponse> {
  const url = new URL('/api/home/decision', window.location.origin)
  url.searchParams.set('customerId', customerId)

  const timeout = AbortSignal.timeout(DECISION_TIMEOUT_MS)
  const signal = callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal,
    })
  } catch (error) {
    if (callerSignal?.aborted) throw error
    throw new HomeDecisionError('unavailable')
  }

  if (callerSignal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError')
  }
  if (response.status === 400) throw new HomeDecisionError('bad_request')
  if (response.status === 404) throw new HomeDecisionError('not_found')
  if (!response.ok) throw new HomeDecisionError('unavailable')

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new HomeDecisionError('invalid_response', 'Response body was not JSON.')
  }

  const parsed = parseHomeDecision(payload)
  if (!parsed.ok) throw new HomeDecisionError('invalid_response', parsed.reason)
  return parsed.value
}

export function messageForDecisionError(error: unknown): string {
  if (error instanceof HomeDecisionError) {
    switch (error.code) {
      case 'not_found':
        return "We couldn't find a personalized home for this customer. Showing the standard layout."
      case 'bad_request':
        return 'A customer id is required. Showing the standard layout.'
      case 'invalid_response':
        return "The decision response didn't match the contract. Showing the standard layout."
      case 'unavailable':
        return "The decision service didn't respond. Showing the standard layout."
    }
  }
  return "The decision service didn't respond. Showing the standard layout."
}
