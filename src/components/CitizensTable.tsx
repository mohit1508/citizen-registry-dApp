import type { Provider } from 'ethers'
import type { Citizen } from '../types/citizen'
import { useCitizenNote } from '../hooks/useCitizens'
import { useState } from 'react'

function NoteCell({ id, provider }: { id: number; provider: Provider | null }) {
  const [open, setOpen] = useState(false)
  const { data: note, isLoading } = useCitizenNote(provider, open ? id : null)

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-2 py-0.5 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 rounded-sm"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide note' : 'Show note'}
      </button>
      {open && (
        <span className="text-sm text-gray-800">
          {isLoading ? 'Loading…' : (note ?? '—')}
        </span>
      )}
    </div>
  )
}

export default function CitizensTable({
  citizens,
  provider,
}: {
  citizens: Citizen[]
  provider: Provider | null
}) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-lg bg-white dark:bg-gray-900 dark:border-gray-700">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700">
          <tr>
            <th className="text-left px-4 py-3 font-medium">ID</th>
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Age</th>
            <th className="text-left px-4 py-3 font-medium">City</th>
            <th className="text-left px-4 py-3 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          {citizens.map((c) => (
            <tr key={c.id} className="border-b last:border-0 border-gray-300 dark:border-gray-700">
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{c.id}</td>
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3">{c.age}</td>
              <td className="px-4 py-3">{c.city}</td>
              <td className="px-4 py-3">
                <NoteCell id={c.id} provider={provider} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
