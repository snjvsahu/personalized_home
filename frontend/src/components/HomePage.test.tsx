import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'
import { describe, expect, it } from 'vitest'
import { MAYA_OKONKWO } from '../mocks/personas'
import { server } from '../mocks/server'
import { HomePage } from './HomePage'

describe('home page decision loading', () => {
  it('loads an example persona from the decision API', async () => {
    render(<HomePage customerId="maya-okonkwo" />)

    expect(await screen.findByRole('heading', { name: 'A weekend bundle is ready' })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(/example data/i)
    expect(screen.getByRole('link', { name: 'Maya · Prepaid' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a loading state while the decision is in flight', async () => {
    server.use(
      http.get('/api/home/decision', async () => {
        await delay(200)
        return HttpResponse.json(MAYA_OKONKWO)
      }),
    )

    render(<HomePage customerId="maya-okonkwo" />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading your personalized home.')
    expect(await screen.findByRole('heading', { name: 'A weekend bundle is ready' })).toBeInTheDocument()
  })

  it('shows the fallback layout when the customer is unknown', async () => {
    render(<HomePage customerId="no-such-customer" />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/couldn't find a personalized home/i)
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'A weekend bundle is ready' })).not.toBeInTheDocument()
    expect(screen.queryByText(/fictional and comes from the mock layer/i)).not.toBeInTheDocument()
  })

  it('shows the fallback layout when the decision service is down', async () => {
    render(<HomePage customerId="service-outage" />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/didn't respond/i)
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('shows the fallback layout when the payload does not match the contract', async () => {
    server.use(
      http.get('/api/home/decision', () => HttpResponse.json({ contractVersion: '9.0' })),
    )

    render(<HomePage customerId="maya-okonkwo" />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/didn't match the contract/i)
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('shows the standard layout without calling a customer when the id is missing', () => {
    render(<HomePage customerId={null} />)

    expect(screen.getByRole('note')).toHaveTextContent(/customerId query parameter/i)
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
    expect(screen.queryByText(/fictional and comes from the mock layer/i)).not.toBeInTheDocument()
  })

  it('retries a failed decision and renders the persona', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/home/decision', () =>
        HttpResponse.json(
          { error: 'decision_unavailable', message: 'Example API: down' },
          { status: 503 },
        ),
      ),
    )

    render(<HomePage customerId="maya-okonkwo" />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/standard layout/i)

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('heading', { name: 'A weekend bundle is ready' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
