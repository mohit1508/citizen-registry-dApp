/* istanbul ignore file */
// Citizen data services
// - fetchCitizens: reads past Citizen events and reconstructs displayable fields
// - fetchNote: lazily fetches note for a given citizen id
// Important: `city` is an indexed string in the event. Indexed strings emit only the hash in topics.
// To recover human-readable strings, we parse the transaction input where possible.
import type { Provider, Log } from 'ethers'
import type { Citizen } from '../types/citizen'
import { getCitizenContract, getCitizenInterface } from '../hooks/useCitizenContract'
import { env } from '../env'

/* istanbul ignore next: config value read once at module load */
const DEPLOY_BLOCK = Number(env.VITE_DEPLOY_BLOCK ?? 0)

export async function fetchCitizens(provider: Provider): Promise<Citizen[]> {
  const iface = getCitizenInterface()
  const topic = iface.getEvent('Citizen')!.topicHash
  const address = env.VITE_CONTRACT_ADDRESS as string

  const logs: Log[] = await provider.getLogs({
    address,
    fromBlock: BigInt(DEPLOY_BLOCK),
    toBlock: 'latest',
    topics: [topic],
  })

  // Parse and map logs to Citizen objects; for indexed strings (city) decode from tx input.
  // If tx parsing fails (e.g., indirect invocation), we fall back to 'Unknown'.
  const parsed: Citizen[] = await Promise.all(
    logs.map(async (log) => {
      const decoded = iface.parseLog(log)!
      const id = Number(decoded.args[0])
      let age = Number(decoded.args[1])
      let name = String(decoded.args[3])
      let city = 'Unknown'
      // If the third arg decodes to a string, it may be either the real city (non-indexed)
      // or the indexed hash (0x + 64 hex). If it's a hash, display a short index preview.
      const maybeCity = decoded.args[2] as unknown
      if (typeof maybeCity === 'string' && maybeCity.length > 0) {
        const isHash = /^0x[0-9a-fA-F]{64}$/.test(maybeCity)
        city = isHash ? `${maybeCity.slice(0, 10)}...` : maybeCity
      } else if (
        maybeCity &&
        typeof maybeCity === 'object' &&
        'hash' in (maybeCity as Record<string, unknown>)
      ) {
        const hash = (maybeCity as { hash?: unknown }).hash
        if (typeof hash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(hash)) {
          city = `${hash.slice(0, 10)}...`
        }
      }

      try {
        const tx = await provider.getTransaction(log.transactionHash)
        if (tx) {
          const parsedTx = iface.parseTransaction({ data: tx.data, value: tx.value })
          if (parsedTx && parsedTx.name === 'addCitizen') {
            const [ageBn, cityStr, nameStr] = parsedTx.args as unknown as [bigint, string, string, string]
            age = Number(ageBn)
            city = cityStr
            name = nameStr
          }
        }
      } catch {
        // swallow; leave defaults when decode is not possible
      }

      return { id, age, city, name }
    })
  )

  // De-duplicate by id (in case of reorgs or repeated emits)
  const byId = new Map<number, Citizen>()
  for (const c of parsed) byId.set(c.id, c)
  return Array.from(byId.values()).sort((a, b) => a.id - b.id)
}

export async function fetchNote(provider: Provider, id: number) {
  const contract = getCitizenContract(provider)
  return contract.getNoteByCitizenId(id) as Promise<string>
}
