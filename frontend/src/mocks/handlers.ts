import { http, HttpResponse } from 'msw/http'
import type { HomeDecisionErrorBody } from '../types/homeDecision'
import { EXAMPLE_PERSONAS } from './personas'

/** EXAMPLE DATA handlers for the pilot. They are not a production decision service. */
export const handlers = [
  http.get('/api/home/decision', ({ request }) => {
    const customerId = new URL(request.url).searchParams.get('customerId')?.trim() ?? ''

    if (!customerId) {
      const body: HomeDecisionErrorBody = {
        error: 'customer_id_required',
        message: 'Example API: customerId is required.',
      }
      return HttpResponse.json(body, { status: 400 })
    }

    if (customerId === 'service-outage') {
      const body: HomeDecisionErrorBody = {
        error: 'decision_unavailable',
        message: 'Example API: the decision service is unavailable.',
      }
      return HttpResponse.json(body, { status: 503 })
    }

    const persona = EXAMPLE_PERSONAS[customerId]
    if (!persona) {
      const body: HomeDecisionErrorBody = {
        error: 'customer_not_found',
        message: `Example API: no persona for customerId "${customerId}".`,
      }
      return HttpResponse.json(body, { status: 404 })
    }

    return HttpResponse.json(persona)
  }),
]
