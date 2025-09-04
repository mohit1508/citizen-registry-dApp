/**
 * main.test.tsx
 * Ensures the app entry mounts into #root without crashing.
 */
import * as ReactDOMClient from 'react-dom/client'

jest.mock('react-dom/client', () => {
  const createRoot = jest.fn(() => ({ render: jest.fn() }))
  return {
    __esModule: true,
    default: { createRoot },
    createRoot,
  }
})

describe('main entry', () => {
  it('calls createRoot with #root element', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    await import('./main')
    const createRootMock = ReactDOMClient.createRoot as unknown as jest.Mock
    expect(createRootMock.mock.calls[0][0].id).toBe('root')
  })
})
