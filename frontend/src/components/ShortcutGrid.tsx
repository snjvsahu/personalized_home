import { useId, type MouseEvent } from 'react'
import { MAX_SHORTCUT_TILES, type ShortcutsSlot } from '../types/homeDecision'
import { Icon } from './Icon'

type ShortcutGridProps = {
  slot: ShortcutsSlot
  onActivate: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function ShortcutGrid({ slot, onActivate }: ShortcutGridProps) {
  const headingId = useId()
  const tiles = slot.tiles.slice(0, MAX_SHORTCUT_TILES)

  return (
    <nav className="shortcuts" aria-labelledby={headingId}>
      <h2 id={headingId} className="section-title">
        {slot.title}
      </h2>
      {tiles.length === 0 ? (
        <p>No shortcuts were returned for this line.</p>
      ) : (
        <ul className="shortcut-list">
          {tiles.map((tile) => (
            <li key={tile.id}>
              <a
                className="tile"
                href={tile.href}
                data-label={tile.label}
                aria-label={tile.badge ? `${tile.label}, ${tile.badge}` : tile.label}
                onClick={onActivate}
              >
                <span className="icon-wrap">
                  <Icon name={tile.icon} />
                </span>
                <span className="tile-label-row">
                  <span className="tile-label">{tile.label}</span>
                  {tile.badge ? <span className="tile-badge">{tile.badge}</span> : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
