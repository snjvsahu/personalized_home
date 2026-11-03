import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MAX_SHORTCUT_TILES } from '../types/homeDecision'
import { errorNotice } from '../view/notices'
import { fallbackScreenModel, toScreenModel, type HomeScreenModel } from '../view/screenModel'
import { ARUN_DESAI, LENA_BERG, MAYA_OKONKWO } from '../mocks/personas'
import { HomeScreen } from './HomeScreen'

describe('home screen slots', () => {
  it('renders the prepaid hero, shortcuts, notification, and balance', () => {
    render(<HomeScreen model={toScreenModel(MAYA_OKONKWO)} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Hello, Maya Okonkwo' })).toBeInTheDocument()
    expect(screen.getByText('Prepaid · 024 000 0198')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A weekend bundle is ready' })).toBeInTheDocument()
    expect(document.querySelector('time')).toHaveAttribute('datetime', '2026-10-12T08:30:00.000Z')
    expect(screen.getByRole('note')).toHaveTextContent(/example data/i)

    const shortcuts = screen.getByRole('navigation', { name: 'Quick links' })
    expect(within(shortcuts).getAllByRole('link')).toHaveLength(8)
    expect(within(shortcuts).getByRole('link', { name: 'Recharge, Low' })).toHaveAttribute(
      'href',
      '/recharge',
    )

    expect(screen.getByText('Notification')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Airtime is nearly gone' })).toBeInTheDocument()

    const balance = screen.getByRole('region', { name: 'Balance and usage' })
    expect(within(balance).getByText('USD 4.20')).toBeInTheDocument()
    expect(within(balance).getByText('Low')).toBeInTheDocument()
    expect(within(balance).getByRole('progressbar', { name: 'Data, 16% remaining' })).toHaveAttribute(
      'aria-valuenow',
      '16',
    )
    expect(document.querySelector('[data-source="decision"]')).not.toBeNull()
  })

  it('renders a postpaid next-best-offer instead of the prepaid notification', () => {
    render(<HomeScreen model={toScreenModel(ARUN_DESAI)} />)

    expect(screen.getByRole('heading', { name: "October's bill is ready" })).toBeInTheDocument()
    expect(screen.getByText('Next best offer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Unlimited 5G covers your overage' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pay bill, Due' })).toHaveAttribute('href', '/bills')
    expect(screen.queryByRole('heading', { name: 'A weekend bundle is ready' })).not.toBeInTheDocument()
  })

  it('renders broadband shortcuts and the maintenance notification', () => {
    render(<HomeScreen model={toScreenModel(LENA_BERG)} />)

    expect(screen.getByRole('heading', { name: 'Fibre 300 looks healthy' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Speed test' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Outages, Thu' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Maintenance Thursday 02:00-04:00' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows at most 8 shortcut tiles', () => {
    const model = withExtraTile(toScreenModel(MAYA_OKONKWO))
    render(<HomeScreen model={model} />)

    const shortcuts = screen.getByRole('navigation', { name: 'Quick links' })
    expect(within(shortcuts).getAllByRole('link')).toHaveLength(MAX_SHORTCUT_TILES)
    expect(screen.queryByRole('link', { name: 'Hidden tile' })).not.toBeInTheDocument()
  })

  it('keeps shortcut navigation on this pilot', async () => {
    const user = userEvent.setup()
    render(<HomeScreen model={toScreenModel(MAYA_OKONKWO)} />)

    await user.click(screen.getByRole('link', { name: 'Recharge, Low' }))

    expect(screen.getByRole('status')).toHaveTextContent("Recharge isn't part of this pilot yet.")
  })

  it('renders the fallback layout without the example-data flag', () => {
    render(
      <HomeScreen
        model={fallbackScreenModel('unknown')}
        notice={errorNotice("The decision service didn't respond. Showing the standard layout.")}
        onRetry={() => undefined}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(/couldn't load your home/i)
    expect(screen.getByRole('alert')).toHaveTextContent(/standard layout/i)
    expect(screen.getByRole('heading', { level: 1, name: 'Your home' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.queryByText(/fictional and comes from the mock layer/i)).not.toBeInTheDocument()

    const shortcuts = screen.getByRole('navigation', { name: 'Quick links' })
    expect(within(shortcuts).getAllByRole('link')).toHaveLength(4)
    expect(within(shortcuts).getByRole('link', { name: 'Bills and payments' })).toBeInTheDocument()
    expect(document.querySelector('[data-source="fallback"]')).not.toBeNull()
  })
})

function withExtraTile(model: HomeScreenModel): HomeScreenModel {
  return {
    ...model,
    slots: {
      ...model.slots,
      shortcuts: {
        ...model.slots.shortcuts,
        tiles: [
          ...model.slots.shortcuts.tiles,
          { id: 'hidden', label: 'Hidden tile', href: '/hidden', icon: 'help' },
        ],
      },
    },
  }
}
