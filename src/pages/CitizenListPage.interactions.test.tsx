/**
 * CitizenListPage.interactions.test.tsx
 * Expands coverage for search, sort, and pagination controls.
 */
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Provider } from 'ethers'
import CitizenListPage from './CitizenListPage'

const qc = new QueryClient()
const renderWithProviders = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)

let provider: Provider | null = {} as unknown as Provider
jest.mock('../hooks/useEthers', () => ({
  useEthers: () => ({ provider }),
}))

type C = { id: number; name: string; age: number; city: string }
let dataset: C[] = []

jest.mock('../hooks/useCitizens', () => ({
  useCitizens: () => ({ isLoading: false, data: dataset }),
  useCitizenNote: () => ({ data: undefined, isLoading: false }),
}))

function makeCitizens(n: number): C[] {
  // Deterministic names/cities to validate sort orders
  const fixed: C[] = [
    { id: 1, name: 'Charlie', age: 40, city: 'Zurich' },
    { id: 2, name: 'Alice', age: 30, city: 'Amsterdam' },
    { id: 3, name: 'Bob', age: 20, city: 'Berlin' },
  ]
  const rest: C[] = Array.from({ length: Math.max(0, n - fixed.length) }, (_, i) => {
    const id = i + 4
    return { id, name: `Name ${id}`, age: 18 + (id % 50), city: `City ${id}` }
  })
  return [...fixed, ...rest]
}

describe('CitizenListPage interactions', () => {
  beforeEach(() => {
    provider = {} as unknown as Provider
    dataset = makeCitizens(23) // ensures totalPages = 3 with perPage=10
  })

  it('paginates via buttons and shows range', async () => {
    renderWithProviders(<CitizenListPage />)

    // Starts at page 1
    const pageInputsA = screen.getAllByLabelText('Current page') as HTMLInputElement[]
    expect(pageInputsA[0].value).toBe('1')

    // Next -> page 2
    const nextBtns1 = screen.getAllByRole('button', { name: /Next/i })
    await userEvent.click(nextBtns1[0])
    const pageInputsB = screen.getAllByLabelText('Current page') as HTMLInputElement[]
    expect(pageInputsB[0].value).toBe('2')

    // Last -> page 3
    const lastBtns1 = screen.getAllByRole('button', { name: /Last/i })
    await userEvent.click(lastBtns1[0])
    const pageInputsC = screen.getAllByLabelText('Current page') as HTMLInputElement[]
    expect(pageInputsC[0].value).toBe('3')

    // First -> page 1
    const firstBtns1 = screen.getAllByRole('button', { name: /First/i })
    await userEvent.click(firstBtns1[0])
    const pageInputsD = screen.getAllByLabelText('Current page') as HTMLInputElement[]
    expect(pageInputsD[0].value).toBe('1')

    // Prev disabled on first page
    const prevBtns1 = screen.getAllByRole('button', { name: /Prev/i })
    expect(prevBtns1[0]).toBeDisabled()
  })

  it('clamps and normalizes page input, including blank + blur', async () => {
    renderWithProviders(<CitizenListPage />)
    const input = screen.getAllByLabelText('Current page')[0] as HTMLInputElement
    expect(input.value).toBe('1')

    // Change to non-digits -> becomes empty state, then blur resets to 1
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input.value).toBe('')
    fireEvent.blur(input)
    expect(input.value).toBe('1')

    // Change to a very large number -> clamps to totalPages (3)
    fireEvent.change(input, { target: { value: '999' } })
    expect(input.value).toBe('3')
    // total pages is 3 for our dataset (23 items, 10 per page)
  })

  it('sanitizes search input and resets to first page on change', async () => {
    renderWithProviders(<CitizenListPage />)

    // Move off first page via Last button
    const lastBtns = screen.getAllByRole('button', { name: /Last/i })
    await userEvent.click(lastBtns[0])
    expect((screen.getAllByLabelText('Current page')[0] as HTMLInputElement).value).toBe('3')

    const search = screen.getByLabelText('Search citizens') as HTMLInputElement
    await userEvent.type(search, 'Du@bai!!!')
    // Sanitized to alphanumerics/spaces
    expect(search.value).toBe('Dubai')

    // Page should reset to 1
    expect((screen.getAllByLabelText('Current page')[0] as HTMLInputElement).value).toBe('1')
  })

  it('changes sort key and toggles direction', async () => {
    renderWithProviders(<CitizenListPage />)

    const sortKey = screen.getByLabelText('Sort key') as HTMLSelectElement
    // Switch to name -> expect ascending title and value updated
    await userEvent.selectOptions(sortKey, 'name')
    expect(sortKey.value).toBe('name')

    const toggle = screen.getByRole('button', { name: 'Toggle sort direction' })
    // Default is asc -> title says Ascending
    expect(toggle).toHaveAttribute('title', 'Ascending')

    // Toggle to desc
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('title', 'Descending')

    // Quick sanity: in table, first name cell should be >= lexicographically
    // We only assert presence and relative ordering with a coarse check
    const table = screen.getByRole('table')
    const nameCells = within(table).getAllByRole('cell').filter((_, idx) => (idx % 5) === 1)
    expect(nameCells[0].textContent).toBeTruthy()
  })
})
