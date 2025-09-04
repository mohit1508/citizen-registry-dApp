/**
 * useCitizenContract.test.ts
 * Ensures helpers return proper Ethers constructs with configured address.
 */
import { Interface, Contract } from 'ethers'
import type { Provider, JsonRpcSigner } from 'ethers'
import { getCitizenInterface, getCitizenContract } from './useCitizenContract'

describe('useCitizenContract helpers', () => {
  it('returns a valid Interface for the ABI', () => {
    const i = getCitizenInterface()
    expect(i).toBeInstanceOf(Interface)
    expect(typeof i.getEvent).toBe('function')
  })

  it('creates a Contract bound to address and runner', () => {
    const dummyRunner = {} as unknown as Provider | JsonRpcSigner
    const c = getCitizenContract(dummyRunner)
    expect(c).toBeInstanceOf(Contract)
    const meta = c as unknown as { target: string; runner: unknown }
    expect(String(meta.target)).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(meta.runner).toBe(dummyRunner)
  })
})
