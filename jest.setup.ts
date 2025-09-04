// Jest setup file
// - Extends jest-dom matchers
// - Provides light polyfills and global config used across tests
// - Mocks out noisy APIs where helpful

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Some environments may require TextEncoder/Decoder (e.g., libraries using WHATWG streams)
// Node 18+ has them, but ensure present for consistency.
const g = globalThis as unknown as {
  TextEncoder?: typeof TextEncoder
  TextDecoder?: typeof TextDecoder
}
if (!g.TextEncoder) {
  g.TextEncoder = TextEncoder
  g.TextDecoder = TextDecoder
}

// Polyfill matchMedia for tests (jsdom doesn't implement it by default)
if (!(window as any).matchMedia) {
  const mm = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    dispatchEvent: () => false,
  })
  ;(window as any).matchMedia = mm
}

// Silence React Router warnings about not using act() for navigation in basic render tests.
// Tests that interact with navigation should still use proper async utilities.
const originalError = console.error
console.error = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  if (msg.includes('Warning: ReactDOM.render is no longer supported') ||
      msg.includes('Warning: An update to') ||
      msg.includes('You should call act')) {
    return
  }
  return originalError(...args)
}
