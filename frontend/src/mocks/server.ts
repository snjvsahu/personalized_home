import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Test runner entry. The dev server uses the Vite MSW plugin instead. */
export const server = setupServer(...handlers)
