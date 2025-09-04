/**
 * CitizenListPage.test.tsx
 * Covers provider missing, loading, error, empty, and data states.
 */
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CitizenListPage from './CitizenListPage'
import type { Provider } from 'ethers'

const qc = new QueryClient()

let provider: Provider | null = null
jest.mock('../hooks/useEthers', () => ({
  useEthers: () => ({ provider }),
}))

let state: 'loading' | 'error' | 'empty' | 'data' = 'loading'
let error: Error = new Error('boom')
jest.mock('../hooks/useCitizens', () => ({
  useCitizens: () => {
    if (state === 'loading') return { isLoading: true }
    if (state === 'error') return { isLoading: false, isError: true, error }
    if (state === 'empty') return { isLoading: false, data: [] }
    return { isLoading: false, data: [{ id: 1, name: 'Alice', age: 30, city: 'Dubai' }] }
  },
  // Provide a noop implementation for CitizenCard usage
  useCitizenNote: () => ({ data: undefined, isLoading: false }),
}))

const renderWithProviders = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)

describe('CitizenListPage', () => {
  beforeEach(() => { provider = null; state = 'loading'; error = new Error('boom') })

  it('asks to install/connect MetaMask when no provider', () => {
    renderWithProviders(<CitizenListPage />)
    expect(screen.getByText(/Install & connect MetaMask/i)).toBeInTheDocument()
  })

  it('shows loading', () => {
    provider = {} as unknown as Provider;
    state = 'loading'
    renderWithProviders(<CitizenListPage />)
    expect(screen.getByText(/Loading citizens/i)).toBeInTheDocument()
  })

  it('shows error message', () => {
    provider = {} as unknown as Provider;
    state = 'error'
    renderWithProviders(<CitizenListPage />)
    expect(screen.getByText(/Error loading citizens/)).toBeInTheDocument()
  })

  it('shows empty message', () => {
    provider = {} as unknown as Provider;
    state = 'empty'
    renderWithProviders(<CitizenListPage />)
    expect(screen.getByText('No citizens found.')).toBeInTheDocument()
  })

  it('renders list/table when data available', () => {
    provider = {} as unknown as Provider;
    state = 'data'
    renderWithProviders(<CitizenListPage />)
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
  })
})
