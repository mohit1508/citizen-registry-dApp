import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast from 'react-hot-toast'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn() },
  error: jest.fn(),
}))

jest.mock('../hooks/useEthers', () => ({ useEthers: () => ({ provider: null }) }))

import AddCitizenPage from './AddCitizenPage'

describe('AddCitizenPage (no provider)', () => {
  it('shows MetaMask not detected when provider missing', async () => {
    
    const qc = new QueryClient()
    const user = userEvent.setup()
    render(
      <QueryClientProvider client={qc}>
        <AddCitizenPage />
      </QueryClientProvider>
    )
    await user.type(screen.getByPlaceholderText('Alice'), 'Alice')
    await user.type(screen.getByPlaceholderText('33'), '33')
    await user.type(screen.getByPlaceholderText('Dubai'), 'Dubai')
    await user.type(screen.getByPlaceholderText(/Some notes/i), 'Note text')
    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))
    expect(toast.error).toHaveBeenCalledWith('MetaMask not detected')
  })
})
