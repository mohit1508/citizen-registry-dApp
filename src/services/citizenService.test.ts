/**
 * citizenService.test.ts
 * Covers fetchCitizens log mapping, tx parsing fallback, de-duplication, and fetchNote.
 */
import { fetchCitizens, fetchNote } from './citizenService'
import { addLocalCitizen } from './localRegistry'
import { getCitizenInterface } from '../hooks/useCitizenContract'
import type { Provider } from 'ethers'

// Mock contract helpers to avoid depending on real ABI
const mockInterface = {
  getEvent: () => ({ topicHash: '0xdeadbeef' }),
  parseLog: () => ({ args: [1n, 25n, 'x', 'Eve'] }),
  parseTransaction: () => ({ name: 'addCitizen', args: [33n, 'Dubai', 'Alice', 'note'] }),
}
const mockContract = { getNoteByCitizenId: jest.fn(async (id: number) => `note-${id}`) }

jest.mock('../hooks/useCitizenContract', () => ({
  getCitizenInterface: () => mockInterface,
  getCitizenContract: () => mockContract,
}))

describe('citizenService', () => {
  it('maps logs to citizens and de-duplicates by id', async () => {
    const provider = {
      getLogs: jest.fn().mockResolvedValue([
        { transactionHash: '0xaaa' },
        { transactionHash: '0xbbb' },
        { transactionHash: '0xccc' },
      ]),
      getTransaction: jest
        .fn()
        // First log decodes via parseTransaction -> Alice/Dubai/33
        .mockResolvedValueOnce({ data: '0x', value: 0 })
        // Second throws to hit fallback and keep Unknown city and name from parseLog
        .mockRejectedValueOnce(new Error('nope'))
        // Third is duplicate id; mapped same id=1 will de-duplicate
        .mockResolvedValueOnce({ data: '0x', value: 0 }),
    } as unknown as Provider

    const citizens = await fetchCitizens(provider)
    expect(provider.getLogs).toHaveBeenCalled()
    expect(citizens.length).toBeGreaterThan(0)
    // After de-dup by id, only 1 item remains
    expect(citizens).toHaveLength(1)
    expect(citizens[0]).toEqual({ id: 1, age: 33, city: 'Dubai', name: 'Alice' })
  })

  it('uses city from log when available and tx is null', async () => {
    const provider = {
      getLogs: jest.fn().mockResolvedValue([{ transactionHash: '0xaaa' }]),
      getTransaction: jest.fn().mockResolvedValue(null),
    } as unknown as Provider
    const list = await fetchCitizens(provider)
    // parseLog mock provides 'x' at index 2; service should use it
    expect(list[0].city).toBe('x')
    // name comes from parseLog mock: 'Eve'
    expect(list[0].name).toBe('Eve')
  })

  it('falls back to log city when parsedTx name is not addCitizen', async () => {
    const provider = {
      getLogs: jest.fn().mockResolvedValue([{ transactionHash: '0xaaa' }]),
      getTransaction: jest.fn().mockResolvedValue({ data: '0x', value: 0 }),
    } as unknown as Provider
    // Override parseTransaction to return a different method name
    const iface = getCitizenInterface() as unknown as { parseTransaction: () => { name: string; args: unknown[] } }
    iface.parseTransaction = () => ({ name: 'other', args: [] })
    const list = await fetchCitizens(provider)
    expect(list[0].city).toBe('x')
  })

  it('formats indexed city hash from log (Indexed object)', async () => {
    const provider = {
      getLogs: jest.fn().mockResolvedValue([{ transactionHash: '0xaaa' }]),
      getTransaction: jest.fn().mockResolvedValue(null),
    } as unknown as Provider

    const iface = getCitizenInterface() as unknown as {
      parseLog: (log?: unknown) => { args: unknown[] }
    }
    const hash = '0xdffe39fd818a9c9aa835fbc90c642ed99cc83f3b4a621c0cbbc5a0cc9f9b398b'
    iface.parseLog = () => ({ args: [1n, 25n, { hash, _isIndexed: true }, 'Eve'] })

    const list = await fetchCitizens(provider)
    expect(list[0].city).toBe(`${hash.slice(0, 10)}...`)
  })

  it('formats indexed city when provided as a plain hash string', async () => {
    const provider = {
      getLogs: jest.fn().mockResolvedValue([{ transactionHash: '0xaaa' }]),
      getTransaction: jest.fn().mockResolvedValue(null),
    } as unknown as Provider

    const iface = getCitizenInterface() as unknown as {
      parseLog: (log?: unknown) => { args: unknown[] }
    }
    const hash = '0xdffe39fd818a9c9aa835fbc90c642ed99cc83f3b4a621c0cbbc5a0cc9f9b398b'
    iface.parseLog = () => ({ args: [1n, 25n, hash, 'Eve'] })

    const list = await fetchCitizens(provider)
    expect(list[0].city).toBe(`${hash.slice(0, 10)}...`)
  })

  it('fetchNote calls contract getter', async () => {
    const result = await fetchNote({} as unknown as Provider, 7)
    expect(result).toBe('note-7')
  })

  it('merges local citizens and reads local note', async () => {
    const local = addLocalCitizen({ age: 21, city: 'LocalCity', name: 'LocalName', someNote: 'LocalNote' })
    const provider = {
      getLogs: jest.fn().mockResolvedValue([{ transactionHash: '0xaaa' }]),
      getTransaction: jest.fn().mockResolvedValue(null),
    } as unknown as Provider
    const list = await fetchCitizens(provider)
    expect(list.some((c) => c.id === local.id && c.name === 'LocalName')).toBe(true)
    const note = await fetchNote({} as unknown as Provider, local.id)
    expect(note).toBe('LocalNote')
  })
})
