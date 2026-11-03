export type HomeNotice = {
  tone: 'error' | 'info'
  title: string
  message: string
}

export function errorNotice(message: string): HomeNotice {
  return {
    tone: 'error',
    title: "Couldn't load your home",
    message,
  }
}

export function missingCustomerNotice(): HomeNotice {
  return {
    tone: 'info',
    title: 'Standard layout',
    message:
      'Add a customerId query parameter to load a personalized home. Showing the standard layout.',
  }
}
