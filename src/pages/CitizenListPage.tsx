// CitizenListPage
// Lists citizens fetched via React Query and renders each with CitizenCard.
// Improved empty/loading/error states with centered layouts.
import { useEthers } from '../hooks/useEthers'
import { useCitizens } from '../hooks/useCitizens'
import { useMemo, useState } from 'react'
import CitizenCard from '../components/CitizenCard'
import CitizensTable from '../components/CitizensTable'

export default function CitizensListPage() {
  const { provider } = useEthers()
  const { data, isLoading, isError, error } = useCitizens(provider)
  const [page, setPage] = useState(1)
  const perPage = 10

  // Pagination (compute early so hooks order stays consistent)
  const { items, totalPages, start, end, total } = useMemo(() => {
    const totalAll = data?.length ?? 0
    const totalPages = Math.max(1, Math.ceil(totalAll / perPage))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * perPage
    const end = Math.min(start + perPage, totalAll)
    const src = data ?? []
    return { items: src.slice(start, end), totalPages, start, end, total: totalAll }
  }, [data, page])

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

  const canPrev = page > 1
  const canNext = page < totalPages

  const Pager = (
    <div className="mt-4 flex items-center justify-between text-sm">
      <div className="text-gray-600 dark:text-gray-400">Showing {start + 1}-{end} of {total}</div>
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          onClick={() => setPage(1)}
          disabled={!canPrev}
          aria-label="First page"
        >First</button>
        <button
          className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev}
          aria-label="Previous page"
        >Prev</button>
        <span className="mx-1 text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</span>
        <button
          className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={!canNext}
          aria-label="Next page"
        >Next</button>
        <button
          className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          onClick={() => setPage(totalPages)}
          disabled={!canNext}
          aria-label="Last page"
        >Last</button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: cards */}
      <div className="md:hidden grid gap-4">
        {items.map((c) => (
          <CitizenCard key={c.id} c={c} provider={provider} />
        ))}
      </div>
      <div className="md:hidden">{Pager}</div>

      {/* Desktop: table */}
      <CitizensTable citizens={items} provider={provider} />
      <div className="hidden md:block">{Pager}</div>
    </>
  )
}
