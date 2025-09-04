/**
 * ConnectButton.test.tsx
 * Covers: idle render, success flow, error flow, and connected state.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import toast from 'react-hot-toast'
import ConnectButton from './ConnectButton'

// Mock toast to capture messages without rendering UI
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  success: jest.fn(),
  error: jest.fn(),
}))

// Mock useEthers to control behavior/state
const connect = jest.fn()
const ensureSepolia = jest.fn()
let mockAccount: string | null = null
jest.mock('../hooks/useEthers', () => ({
  useEthers: () => ({ connect, ensureSepolia, account: mockAccount }),
}))

describe('ConnectButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAccount = null
  })

  it('renders the connect CTA initially', () => {
    render(<ConnectButton />)
    expect(screen.getByText('Connect MetaMask')).toBeInTheDocument()
  })

  it('handles successful connect flow and shows success toast', async () => {
    connect.mockResolvedValueOnce(undefined)
    ensureSepolia.mockResolvedValueOnce(undefined)
    render(<ConnectButton />)
    fireEvent.click(screen.getByText('Connect MetaMask'))
    await waitFor(() => expect(connect).toHaveBeenCalled())
    expect(ensureSepolia).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Wallet connected')
  })

  it('handles failure and shows error toast', async () => {
    connect.mockRejectedValueOnce(new Error('No wallet'))
    render(<ConnectButton />)
    fireEvent.click(screen.getByText('Connect MetaMask'))
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error).toHaveBeenCalledWith('No wallet')
  })

  it('handles non-Error rejection with generic message', async () => {
    connect.mockRejectedValueOnce('bad')
    render(<ConnectButton />)
    fireEvent.click(screen.getByText('Connect MetaMask'))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to connect'))
  })

  it('renders short account when already connected', () => {
    mockAccount = '0x1234567890abcdef1234567890abcdef12345678'
    render(<ConnectButton />)
    // Only check meaningful part to avoid special ellipsis char dependency
    expect(screen.getByText(/0x1234/i)).toBeInTheDocument()
  })

  it('shows busy state while connecting', async () => {
    connect.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 20)))
    ensureSepolia.mockResolvedValue(undefined)
    render(<ConnectButton />)
    // Kick off connection
    fireEvent.click(screen.getByText('Connect MetaMask'))
    // Busy text should appear immediately
    expect(screen.getByText(/Connecting/i)).toBeInTheDocument()
  })
})
