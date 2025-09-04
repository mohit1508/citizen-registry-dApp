/**
 * CitizenCard.test.tsx
 * Tests toggling note visibility and loading state.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import CitizenCard from './CitizenCard'
import type { Citizen } from '../types/citizen'

let isLoading = false
let note: string | undefined = undefined
jest.mock('../hooks/useCitizens', () => ({
  useCitizenNote: () => ({ data: note, isLoading }),
}))

const c: Citizen = { id: 1, name: 'Alice', age: 30, city: 'Dubai' }

describe('CitizenCard', () => {
  beforeEach(() => { isLoading = false; note = undefined })

  it('renders citizen info', () => {
    render(<CitizenCard c={c} provider={null} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('ID 1')).toBeInTheDocument()
  })

  it('shows loading then note on toggle', () => {
    isLoading = true
    render(<CitizenCard c={c} provider={null} />)
    fireEvent.click(screen.getByText('Show note'))
    expect(screen.getByText(/Loading note/i)).toBeInTheDocument()
  })

  it('shows note content when loaded', () => {
    note = 'Hello there'
    render(<CitizenCard c={c} provider={null} />)
    fireEvent.click(screen.getByText('Show note'))
    expect(screen.getByText('Hello there')).toBeInTheDocument()
  })

  it('shows fallback when note is empty', () => {
    note = undefined
    isLoading = false
    render(<CitizenCard c={c} provider={null} />)
    fireEvent.click(screen.getByText('Show note'))
    expect(screen.getByText('Hide note')).toBeInTheDocument()
    // Fallback dash is rendered when note is empty
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
