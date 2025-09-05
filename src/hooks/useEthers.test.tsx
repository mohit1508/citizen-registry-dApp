/**
 * useEthers.test.tsx
 * Covers initialization, connect(), and ensureSepolia() including 4902 add-chain branch.
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useEthers } from './useEthers'

// Mock ethers BrowserProvider and signer behavior
const getNetwork = jest.fn().mockResolvedValue({ chainId: 11155111 })
const getAddress = jest.fn().mockResolvedValue('0x1234567890abcdef1234567890abcdef12345678')
const getSigner = jest.fn().mockResolvedValue({ getAddress })

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers')
  type ThisCtx = { getSigner: typeof getSigner; getNetwork: typeof getNetwork }
  return {
    ...actual,
    BrowserProvider: function (this: ThisCtx) {
      this.getSigner = getSigner
      this.getNetwork = getNetwork
    },
  }
})

describe('useEthers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    type MockEthereum = {
      request: jest.Mock<Promise<unknown>, [{ method: string; params?: unknown[] }]>
      on: jest.Mock
      removeListener: jest.Mock
    }
    const win = window as unknown as { ethereum?: MockEthereum }
    win.ethereum = {
      request: jest.fn(async ({ method }: { method: string }) => {
        if (method === 'eth_accounts') return []
        if (method === 'eth_chainId') return '0xAA36A7'
        if (method === 'eth_requestAccounts') return ['0xabc']
        return null
      }),
      on: jest.fn(),
      removeListener: jest.fn(),
    }
  })

  afterAll(() => {
    // Clean up global ethereum mock to avoid leaking into other test files
    delete (window as unknown as { ethereum?: unknown }).ethereum
  })

  it('initializes provider and subscribes to events', async () => {
    const { result, unmount } = renderHook(() => useEthers())
    await waitFor(() => expect(result.current.ready).toBe(true))
    const win = window as unknown as { ethereum: { on: jest.Mock; removeListener: jest.Mock } }
    expect(win.ethereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function))
    expect(win.ethereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function))
    unmount()
    expect(win.ethereum.removeListener).toHaveBeenCalled()
  })

  it('connect() populates signer/account/chainId', async () => {
    const { result } = renderHook(() => useEthers())
    await waitFor(() => expect(result.current.ready).toBe(true))
    await act(async () => { await result.current.connect() })
    expect(getSigner).toHaveBeenCalled()
    expect(getAddress).toHaveBeenCalled()
    expect(result.current.account).toMatch(/^0x/i)
    expect(result.current.chainId).toBe(11155111)
  })

  it('ensureSepolia: switches chain when available', async () => {
    const request = (window as unknown as { ethereum: { request: jest.Mock } }).ethereum.request
    // Return non-Sepolia chain id for both initialization and ensure path
    request.mockImplementation(async ({ method }: { method: string }) => {
      if (method === 'eth_accounts') return []
      if (method === 'eth_chainId') return '0x1'
      return undefined
    })
    const { result } = renderHook(() => useEthers())
    await act(async () => { await result.current.ensureSepolia() })
    expect(request).toHaveBeenCalledWith({ method: 'wallet_switchEthereumChain', params: [expect.any(Object)] })
  })

  it('ensureSepolia: adds chain when unknown (code 4902)', async () => {
    const req = (window as unknown as { ethereum: { request: jest.Mock } }).ethereum.request
    // Provide a full implementation covering initialization calls and the switch/add flow
    req.mockImplementation(async ({ method }: { method: string }) => {
      if (method === 'eth_accounts') return []
      if (method === 'eth_chainId') return '0x1'
      if (method === 'wallet_switchEthereumChain') throw { code: 4902 }
      if (method === 'wallet_addEthereumChain') return undefined
      return undefined
    })
    const { result } = renderHook(() => useEthers())
    await act(async () => { await result.current.ensureSepolia() })
    // Assert that an addEthereumChain call occurred among requests
    const calls = (req.mock.calls as Array<[ { method: string; params?: unknown[] } ]>).map((c) => c[0])
    expect(calls.some((c) => c.method === 'wallet_addEthereumChain')).toBe(true)
  })

  it('ensureSepolia: rethrows non-4902 errors', async () => {
    const req = (window as unknown as { ethereum: { request: jest.Mock } }).ethereum.request
    req.mockImplementation(async ({ method }: { method: string }) => {
      if (method === 'wallet_switchEthereumChain') throw { code: 4001 }
      return undefined
    })
    const { result } = renderHook(() => useEthers())
    await expect(result.current.ensureSepolia()).rejects.toEqual({ code: 4001 })
  })

  it('throws when MetaMask not found (ensureSepolia)', async () => {
    delete (window as unknown as { ethereum?: unknown }).ethereum
    const { result } = renderHook(() => useEthers())
    await expect(result.current.ensureSepolia()).rejects.toThrow('MetaMask not found')
  })

  it('throws when MetaMask not found (connect)', async () => {
    delete (window as unknown as { ethereum?: unknown }).ethereum
    const { result } = renderHook(() => useEthers())
    await expect(result.current.connect()).rejects.toThrow('MetaMask not found')
  })
})
