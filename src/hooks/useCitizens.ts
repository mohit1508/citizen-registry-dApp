// React Query hooks to fetch citizens and notes
// - useCitizens: list of Citizen objects (without note)
// - useCitizenNote: per-citizen note, fetched lazily and cached indefinitely
import { useQuery } from '@tanstack/react-query'
import type { Provider } from 'ethers'
import { fetchCitizens, fetchNote } from '../services/citizenService'

export function useCitizens(provider: Provider | null) {
  const enabled = Boolean(provider)
  const query = useQuery({
    queryKey: ['citizens'],
    queryFn: () => fetchCitizens(provider as Provider),
    enabled,
  })
  return query
}

export function useCitizenNote(provider: Provider | null, id: number | null) {
  return useQuery({
    queryKey: ['citizen-note', id],
    queryFn: () => fetchNote(provider as Provider, id as number),
    enabled: Boolean(provider && id != null),
    staleTime: Infinity,
  })
}
