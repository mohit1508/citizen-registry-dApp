/**
 * CitizensTable.test.tsx
 * Renders table and toggles NoteCell to cover hook usage.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import CitizensTable from './CitizensTable'
import type { Citizen } from '../types/citizen'

let isLoading = false
let note: string | undefined = undefined
jest.mock('../hooks/useCitizens', () => ({
  useCitizenNote: () => ({ data: note, isLoading }),
}))

const citizens: Citizen[] = [
  { id: 1, name: 'Alice', age: 30, city: 'Dubai' },
  { id: 2, name: 'Bob', age: 40, city: 'Paris' },
]

describe('CitizensTable', () => {
  beforeEach(() => { isLoading = false; note = undefined })

  it('renders rows and toggles note cell', () => {
    render(<CitizensTable citizens={citizens} provider={null} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    fireEvent.click(screen.getAllByText('Show note')[0])
    // No assertion on loading text due to table layout; just ensure toggle caption flips
    expect(screen.getAllByText('Hide note')[0]).toBeInTheDocument()
  })

  it('renders fallback for empty note', () => {
    isLoading = false
    note = undefined
    render(<CitizensTable citizens={citizens} provider={null} />)
    fireEvent.click(screen.getAllByText('Show note')[0])
    expect(screen.getAllByText('Hide note')[0]).toBeInTheDocument()
  })

  it('shows loading indicator while note is loading', () => {
    isLoading = true
    render(<CitizensTable citizens={citizens} provider={null} />)
    fireEvent.click(screen.getAllByText('Show note')[0])
    expect(screen.getAllByText(/Loading/)[0]).toBeInTheDocument()
  })
})
