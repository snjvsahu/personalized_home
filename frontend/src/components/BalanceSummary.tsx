import { useId } from 'react'
import type { BalanceItem, BalanceSlot } from '../types/homeDecision'

const LOW_REMAINING_PERCENT = 20

export function BalanceSummary({ slot }: { slot: BalanceSlot }) {
  const headingId = useId()

  return (
    <section className="card balance" aria-labelledby={headingId}>
      <h2 id={headingId} className="section-title">
        {slot.title}
      </h2>
      {slot.items.length === 0 ? (
        <p>No usage was returned.</p>
      ) : (
        <ul className="balance-list">
          {slot.items.map((item) => (
            <BalanceRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  )
}

function BalanceRow({ item }: { item: BalanceItem }) {
  const percent =
    typeof item.percentRemaining === 'number'
      ? Math.min(100, Math.max(0, Math.round(item.percentRemaining)))
      : null
  const low = percent !== null && percent <= LOW_REMAINING_PERCENT

  return (
    <li className="balance-row">
      <div className="balance-top">
        <span className="balance-label">{item.label}</span>
        <span className="balance-value">
          {item.displayValue}
          {item.displayTotal ? <span className="balance-total"> {item.displayTotal}</span> : null}
        </span>
      </div>
      {percent !== null ? (
        <div
          className={low ? 'meter meter-low' : 'meter'}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`${item.label}, ${percent}% remaining`}
        >
          <span className="meter-fill" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
      {low || item.hint ? (
        <p className="balance-hint">
          {low ? <strong className="low-flag">Low</strong> : null}
          {low && item.hint ? <span aria-hidden="true"> · </span> : null}
          {item.hint}
        </p>
      ) : null}
    </li>
  )
}
