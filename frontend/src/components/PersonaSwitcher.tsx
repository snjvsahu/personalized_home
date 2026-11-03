import { useId } from 'react'
import { PREVIEW_CUSTOMERS, scenarioHref } from '../previewCustomers'

export function PersonaSwitcher({ activeCustomerId }: { activeCustomerId: string | null }) {
  const labelId = useId()

  return (
    <nav className="scenarios" aria-labelledby={labelId}>
      <p id={labelId} className="scenario-label">
        Example scenarios
      </p>
      <ul className="scenario-list">
        {PREVIEW_CUSTOMERS.map((scenario) => {
          const current = scenario.id === activeCustomerId
          return (
            <li key={scenario.id}>
              <a href={scenarioHref(scenario.id)} aria-current={current ? 'page' : undefined}>
                {scenario.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
