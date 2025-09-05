// Local registry stored in sessionStorage for ephemeral adds without on-chain tx.
// Provides helper functions to add/read citizens and notes during the active session.
import type { Citizen } from '../types/citizen'

type LocalCitizen = Citizen & { someNote: string }

const KEY = 'localCitizens'

function readAll(): LocalCitizen[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalCitizen[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean)
  } catch {
    return []
  }
}

function writeAll(list: LocalCitizen[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // ignore quota/security errors
  }
}

export function addLocalCitizen(input: { age: number; city: string; name: string; someNote: string }): Citizen {
  const list = readAll()
  // Generate a stable negative id sequence to avoid collision with on-chain ids (which are positive and auto-incremented)
  // Start at -1, then -2, -3, ... based on the smallest existing local id
  let id = -1
  if (list.length) {
    const minId = Math.min(...list.map((c) => c.id))
    id = minId < 0 ? minId - 1 : -1
  }
  const item: LocalCitizen = { id, age: input.age, city: input.city, name: input.name, someNote: input.someNote }
  list.push(item)
  writeAll(list)
  return { id, age: item.age, city: item.city, name: item.name }
}

export function getLocalCitizens(): Citizen[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return readAll().map(({ someNote, ...rest }) => rest)
}

export function getLocalNote(id: number): string | null {
  const list = readAll()
  const found = list.find((c) => c.id === id)
  return found?.someNote ?? null
}
