/**
 * AddCitizenPage.test.tsx
 * Covers validation errors, success submission, and error normalization path.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AddCitizenPage from './AddCitizenPage'

// Mock toasts so we can assert calls without UI
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn(), loading: jest.fn() },
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
}))

// Mock Ethers helpers
const ensureSepolia = jest.fn()
const connect = jest.fn()
let account: string | null = null
const signer = {}
const provider = { getSigner: jest.fn().mockResolvedValue(signer) }
jest.mock('../hooks/useEthers', () => ({
  useEthers: () => ({ provider, ensureSepolia, connect, account }),
}))

// Mock contract factory
const addCitizen = jest.fn()
jest.mock('../hooks/useCitizenContract', () => ({
  getCitizenContract: () => ({ addCitizen }),
}))

const qc = new QueryClient()
const renderWithProviders = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)

describe('AddCitizenPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(provider.getSigner as jest.Mock).mockResolvedValue(signer)
    account = null
  })

  it('shows validation errors when fields are touched and left empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AddCitizenPage />)
    await user.click(screen.getByLabelText('Name'))
    await user.tab()
    await user.click(screen.getByLabelText('Age'))
    await user.tab()
    await user.click(screen.getByLabelText('City'))
    await user.tab()
    await user.click(screen.getByLabelText('Note'))
    await user.tab()
    expect(await screen.findByText('Name cannot be empty.')).toBeInTheDocument()
    expect(screen.getByText('Age cannot be empty.')).toBeInTheDocument()
    expect(screen.getByText('City cannot be empty.')).toBeInTheDocument()
    expect(screen.getByText('Note is required')).toBeInTheDocument()
  })

  it('submits successfully and resets form', async () => {
    const user = userEvent.setup()
    const wait = jest.fn().mockResolvedValue(undefined)
    addCitizen.mockResolvedValueOnce({ wait })

    renderWithProviders(<AddCitizenPage />)
    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '33')
    await user.type(screen.getByLabelText('City'), 'Dubai')
    await user.type(screen.getByLabelText('Note'), 'Note text')

    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))

    expect(connect).toHaveBeenCalled()
    expect(ensureSepolia).toHaveBeenCalled()
    expect(provider.getSigner).toHaveBeenCalled()
    expect(addCitizen).toHaveBeenCalledWith(33, 'Dubai', 'Alice', 'Note text')
  })

  it('displays connection status based on account', () => {
    // not connected
    renderWithProviders(<AddCitizenPage />)
    expect(screen.getByText(/not connected/i)).toBeInTheDocument()
  })

  it('shows connected status when account is present', () => {
    account = '0xabc'
    renderWithProviders(<AddCitizenPage />)
    expect(screen.getByText(/connected/i)).toBeInTheDocument()
  })

  it('shows busy state during submission', async () => {
    const user = userEvent.setup()
    // Make addCitizen never resolve immediately to observe busy state
    const pending = new Promise(() => {})
    addCitizen.mockReturnValueOnce(pending)
    renderWithProviders(<AddCitizenPage />)
    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '33')
    await user.type(screen.getByLabelText('City'), 'Dubai')
    await user.type(screen.getByLabelText('Note'), 'Note text')
    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))
    expect(screen.getByText(/Submitting/i)).toBeInTheDocument()
  })

  it('shows normalized error message when transaction fails', async () => {
    const user = userEvent.setup()
    
    addCitizen.mockRejectedValueOnce({ shortMessage: 'Denied' })

    renderWithProviders(<AddCitizenPage />)
    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '33')
    await user.type(screen.getByLabelText('City'), 'Dubai')
    await user.type(screen.getByLabelText('Note'), 'Note text')
    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))

    expect(toast.error).toHaveBeenCalledWith('Denied')
  })

  it('stores locally when user rejects (ACTION_REJECTED)', async () => {
    const user = userEvent.setup()
    addCitizen.mockRejectedValueOnce({ code: 'ACTION_REJECTED' })
    renderWithProviders(<AddCitizenPage />)
    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '33')
    await user.type(screen.getByLabelText('City'), 'Dubai')
    await user.type(screen.getByLabelText('Note'), 'Note text')
    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))
    expect(toast.success).toHaveBeenCalledWith('Citizen added locally for this session')
  })

  it('falls back to Error.message when shortMessage is undefined', async () => {
    const user = userEvent.setup()
    addCitizen.mockRejectedValueOnce({ shortMessage: undefined, message: 'Alt' })
    renderWithProviders(<AddCitizenPage />)
    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '33')
    await user.type(screen.getByLabelText('City'), 'Dubai')
    await user.type(screen.getByLabelText('Note'), 'Note text')
    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))
    expect(toast.error).toHaveBeenCalledWith('Alt')
  })

  it('shows Error.message when rejection is Error', async () => {
    const user = userEvent.setup()
    
    addCitizen.mockRejectedValueOnce(new Error('Boom'))

    renderWithProviders(<AddCitizenPage />)
    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '33')
    await user.type(screen.getByLabelText('City'), 'Dubai')
    await user.type(screen.getByLabelText('Note'), 'Note text')
    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))
    expect(toast.error).toHaveBeenCalledWith('Boom')
  })

  it('shows generic message when rejection is unknown', async () => {
    const user = userEvent.setup()
    
    addCitizen.mockRejectedValueOnce('weird')

    renderWithProviders(<AddCitizenPage />)
    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '33')
    await user.type(screen.getByLabelText('City'), 'Dubai')
    await user.type(screen.getByLabelText('Note'), 'Note text')
    await user.click(screen.getByRole('button', { name: /Add Citizen/i }))
    expect(toast.error).toHaveBeenCalledWith('Transaction failed')
  })

  
})
