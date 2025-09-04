/**
 * useCitizens.test.tsx
 * Verifies enabled flag behavior and caching for note hook.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { useCitizens, useCitizenNote } from './useCitizens'
import type { Provider } from 'ethers'

// Mock service calls
const fetchCitizens = jest.fn()
const fetchNote = jest.fn()
jest.mock('../services/citizenService', () => ({
  fetchCitizens: (provider: Provider) => fetchCitizens(provider),
  fetchNote: (provider: Provider, id: number) => fetchNote(provider, id),
}))

const qc = new QueryClient()
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
)

describe('useCitizens', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('does not run when provider is null', async () => {
    renderHook(() => useCitizens(null), { wrapper })
    expect(fetchCitizens).not.toHaveBeenCalled()
  })

  it('runs when provider is set', async () => {
    fetchCitizens.mockResolvedValueOnce([{ id: 1 }])
    const { result } = renderHook(() => useCitizens({} as unknown as Provider), { wrapper })
    await waitFor(() => expect(fetchCitizens).toHaveBeenCalled())
    await waitFor(() => expect(result.current.data?.[0]).toEqual({ id: 1 }))
  })
})

describe('useCitizenNote', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('disabled when no provider or id', () => {
    const { result } = renderHook(() => useCitizenNote(null, null), { wrapper })
    expect(result.current.isLoading).toBe(false)
    expect(fetchNote).not.toHaveBeenCalled()
  })

  it('fetches when provider and id present', async () => {
    fetchNote.mockResolvedValueOnce('note')
    const provider = {} as unknown as Provider
    const { result } = renderHook(() => useCitizenNote(provider, 1), { wrapper })
    await waitFor(() => expect(fetchNote).toHaveBeenCalledWith(provider, 1))
    await waitFor(() => expect(result.current.data).toBe('note'))
  })
})
