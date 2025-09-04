/**
 * sepolia.test.ts
 * Verifies SEPOLIA network object is correctly shaped and defaults are sane.
 */
import { SEPOLIA } from './sepolia'

describe('SEPOLIA utils', () => {
  it('exposes expected fields and default chainIdHex', () => {
    expect(SEPOLIA.chainIdHex).toMatch(/^0x/i)
    expect(SEPOLIA.chainId).toBe(11155111)
    expect(SEPOLIA.chainName).toBe('Ethereum Sepolia')
    expect(Array.isArray(SEPOLIA.rpcUrls)).toBe(true)
    expect(Array.isArray(SEPOLIA.blockExplorerUrls)).toBe(true)
    expect(SEPOLIA.nativeCurrency.symbol).toBe('ETH')
  })

  it('falls back to default chainIdHex when env missing', async () => {
    jest.resetModules()
    jest.doMock('../env', () => ({ env: { VITE_CHAIN_ID: '' } }))
    const mod = await import('./sepolia')
    expect(mod.SEPOLIA.chainIdHex).toBe('0xAA36A7')
  })
})
