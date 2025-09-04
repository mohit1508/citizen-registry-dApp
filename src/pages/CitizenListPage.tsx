// CitizenListPage
// Lists citizens fetched via React Query and renders each with CitizenCard.
// Improved empty/loading/error states with centered layouts.
import { useEthers } from '../hooks/useEthers'
import { useCitizens } from '../hooks/useCitizens'
import CitizenCard from '../components/CitizenCard'
import CitizensTable from '../components/CitizensTable'

export default function CitizensListPage() {
  const { provider } = useEthers()
  const { data, isLoading, isError, error } = useCitizens(provider)

  if (!provider)
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="text-center max-w-md p-6 rounded-lg border border-gray-300 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">Install & connect MetaMask to view citizens.</div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Once connected, your registered citizens will appear here.</p>
        </div>
      </div>
    )

  if (isLoading)
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <span className="h-6 w-6 inline-block rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-700 dark:border-t-gray-300 animate-spin" aria-hidden />
          <span>Loading citizens…</span>
        </div>
      </div>
    )

  if (isError)
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="text-center max-w-md p-6 rounded-lg border border-red-300 bg-white shadow-sm text-red-700 dark:bg-gray-900 dark:border-red-700 dark:text-red-400">
          <div className="font-medium">Error loading citizens</div>
          <p className="mt-2 text-sm">{error instanceof Error ? error.message : 'Failed to fetch'}</p>
        </div>
      </div>
    )

  if (!data?.length)
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="text-center max-w-md p-6 rounded-lg border border-gray-300 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">No citizens found.</div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Try adding one from the “Add Citizen” page.</p>
        </div>
      </div>
    )

  return (
    <>
      {/* Mobile: cards */}
      <div className="md:hidden grid gap-4">
        {data.map((c) => (
          <CitizenCard key={c.id} c={c} provider={provider} />
        ))}
      </div>

      {/* Desktop: table */}
      <CitizensTable citizens={data} provider={provider} />
    </>
  )
}

