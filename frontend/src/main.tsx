async function enableMocks(): Promise<void> {
  if (!import.meta.env.DEV) return

  try {
    const { network } = await import('virtual:msw')
    const { handlers } = await import('./mocks/handlers')
    network.configure({
      handlers,
      onUnhandledFrame: 'bypass',
    })
    await network.enable()
  } catch (error) {
    console.warn(
      '[home-decision] Mock layer failed to start. The screen will use its standard layout.',
      error,
    )
  }
}

await enableMocks()
await import('./bootstrap')
