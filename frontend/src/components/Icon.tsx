export function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="icon" aria-hidden="true" focusable="false">
      <IconPaths name={name} />
    </svg>
  )
}

function IconPaths({ name }: { name: string }) {
  switch (name) {
    case 'recharge':
      return (
        <>
          <path d="M12 3v10" />
          <path d="M8.5 9.5 12 13l3.5-3.5" />
          <path d="M5 21h14" />
        </>
      )
    case 'bundles':
      return (
        <>
          <path d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z" />
          <path d="M4 12.5 12 17l8-4.5" />
          <path d="M4 16.5 12 21l8-4.5" />
        </>
      )
    case 'transfer':
      return (
        <>
          <path d="M4 8h12" />
          <path d="M13 4.5 16.5 8 13 11.5" />
          <path d="M20 16H8" />
          <path d="M11 12.5 7.5 16 11 19.5" />
        </>
      )
    case 'usage':
      return (
        <>
          <path d="M5 19V10" />
          <path d="M12 19V5" />
          <path d="M19 19v-7" />
        </>
      )
    case 'sim':
      return (
        <>
          <path d="M8 3h6l4 4v14H8V3Z" />
          <path d="M10 13h6v5h-6v-5Z" />
        </>
      )
    case 'offers':
      return (
        <>
          <path d="M12 4 14.2 8.7 19.4 9.4 15.6 13l1 5.1L12 15.8 7.4 18.1l1-5.1L4.6 9.4 9.8 8.7 12 4Z" />
        </>
      )
    case 'help':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8" />
          <path d="M12 17h.01" />
        </>
      )
    case 'history':
      return (
        <>
          <path d="M5 12a7 7 0 1 0 2-4.9" />
          <path d="M5 5v3.2h3.2" />
          <path d="M12 8v4.2l2.8 1.6" />
        </>
      )
    case 'bill':
      return (
        <>
          <path d="M7 3h10v18l-2-1.2L13 21l-2-1.2L9 21l-2-1.2V3Z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
        </>
      )
    case 'plan':
      return (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </>
      )
    case 'add-on':
      return (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <path d="M16.5 13v7" />
          <path d="M13 16.5h7" />
        </>
      )
    case 'roaming':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <path d="M12 4c2.4 2.3 3.6 5.1 3.6 8S14.4 17.7 12 20c-2.4-2.3-3.6-5.1-3.6-8S9.6 6.3 12 4Z" />
        </>
      )
    case 'esim':
      return (
        <>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M10 7h4" />
          <path d="M9 17c1.2-1.6 2.2-2.4 3-2.4s1.8.8 3 2.4" />
        </>
      )
    case 'statement':
      return (
        <>
          <path d="M7 3h8l4 4v14H7V3Z" />
          <path d="M15 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </>
      )
    case 'speed':
      return (
        <>
          <path d="M5 16a7 7 0 1 1 14 0" />
          <path d="M12 16l4-5" />
          <path d="M8 19h8" />
        </>
      )
    case 'wifi':
      return (
        <>
          <path d="M4.5 10.5c4.4-4 10.6-4 15 0" />
          <path d="M7.5 13.5c2.6-2.3 6.4-2.3 9 0" />
          <path d="M12 18h.01" />
        </>
      )
    case 'outage':
      return (
        <>
          <path d="M12 4 3.5 19h17L12 4Z" />
          <path d="M12 10v4" />
          <path d="M12 16.5h.01" />
        </>
      )
    case 'devices':
      return (
        <>
          <rect x="3" y="5" width="12" height="9" rx="1.5" />
          <path d="M7 17h4" />
          <rect x="15" y="8" width="6" height="11" rx="1.2" />
        </>
      )
    case 'upgrade':
      return (
        <>
          <path d="M12 20V8" />
          <path d="M7 12l5-5 5 5" />
          <path d="M5 20h14" />
        </>
      )
    case 'move':
      return (
        <>
          <path d="M4 10.5 12 5l8 5.5V20H4V10.5Z" />
          <path d="M10 20v-5h4v5" />
        </>
      )
    case 'account':
      return (
        <>
          <circle cx="12" cy="9" r="3" />
          <path d="M6 19c1.2-2.4 3.2-3.5 6-3.5s4.8 1.1 6 3.5" />
        </>
      )
    default:
      return <circle cx="12" cy="12" r="4" />
  }
}
