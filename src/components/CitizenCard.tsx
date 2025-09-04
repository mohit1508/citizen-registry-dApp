import type { Citizen } from '../types/citizen'
import { useCitizenNote } from '../hooks/useCitizens'
import type { Provider } from 'ethers'
import { useState } from 'react'

export default function CitizenCard({ c, provider }: { c: Citizen; provider: Provider | null }) {
  const [open, setOpen] = useState(false)
  const { data: note, isLoading } = useCitizenNote(provider, open ? c.id : null)

  return (
    <div className="rounded border bg-white p-4 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{c.name}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">ID {c.id}</div>
      </div>
      <div className="text-sm mt-1">Age: <span className="font-medium">{c.age}</span></div>
      <div className="text-sm">City: <span className="font-medium">{c.city}</span></div>

      <button
        className="mt-3 px-2 py-0.5 text-sm bg-gray-100 hover:bg-gray-100 border border-gray-300 rounded-sm dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide note' : 'Show note'}
      </button>
      {open && (
        <div className="mt-2 text-gray-800 dark:text-gray-200">
          {isLoading ? 'Loading note…' : (note ?? '—')}
        </div>
      )}
    </div>
  )
}
// CitizenCard
// Displays citizen summary and loads note lazily via useCitizenNote.
// Expects a Provider to read the note from the contract.
