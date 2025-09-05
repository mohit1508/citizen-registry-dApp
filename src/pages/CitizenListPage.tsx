// CitizenListPage
// Lists citizens fetched via React Query and renders each with CitizenCard.
// Improved empty/loading/error states with centered layouts.
import { useEthers } from '../hooks/useEthers'
import { useCitizens } from '../hooks/useCitizens'
import { useEffect, useMemo, useState } from 'react'
import CitizenCard from '../components/CitizenCard'
import CitizensTable from '../components/CitizensTable'
import { FaSortAmountDownAlt, FaSortAmountUp } from "react-icons/fa"

export default function CitizensListPage() {
  const { provider } = useEthers()
  const { data, isLoading, isError, error } = useCitizens(provider)
  const [page, setPage] = useState(1)
  const [pageText, setPageText] = useState('1')
  const perPage = 10
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'id' | 'name' | 'age' | 'city'>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Pagination (compute early so hooks order stays consistent)
  const { items, totalPages, start, end, total } = useMemo(() => {
    const src = (data ?? []) as { id: number; name: string; age: number; city: string }[]
    const q = search.trim().toLowerCase()
    const qDigits = search.replace(/\D+/g, '')
    const filtered = q
      ? src.filter((c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (qDigits.length > 0 && String(c.age).includes(qDigits))
        )
      : src
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name' || sortKey === 'city') cmp = a[sortKey].localeCompare(b[sortKey])
      else if (sortKey === 'age') cmp = a.age - b.age
      else cmp = a.id - b.id
      return sortDir === 'asc' ? cmp : -cmp
    })
    const totalAll = sorted.length
    const totalPages = Math.max(1, Math.ceil(totalAll / perPage))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * perPage
    const end = Math.min(start + perPage, totalAll)
    return { items: sorted.slice(start, end), totalPages, start, end, total: totalAll }
  }, [data, page, search, sortKey, sortDir])

  // Reset to first page when search/sort changes
  useEffect(() => { setPage(1); setPageText('1') }, [search, sortKey, sortDir])

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
          className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700"
          onClick={() => { setPage(1); setPageText('1') }}
          disabled={!canPrev}
          aria-label="First page"
        >First</button>
        <button
          className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700"
          onClick={() => setPage((p) => { const next = Math.max(1, p - 1); setPageText(String(next)); return next })}
          disabled={!canPrev}
          aria-label="Previous page"
        >Prev</button>
        <span className="mx-1 text-gray-700 dark:text-gray-300 flex items-center gap-1">Page
          <input
            aria-label="Current page"
            type="number"
            min={1}
            max={totalPages}
            inputMode="numeric"
            pattern="[0-9]*"
            value={pageText}
            onKeyDown={(e) => {
              const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Home','End','Tab']
              if (allowed.includes(e.key)) return
              if (!/^\d$/.test(e.key)) { e.preventDefault() }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text')
              if (/\D/.test(text)) e.preventDefault()
            }}
            onChange={(e) => {
              const raw = e.target.value
              const digits = raw.replace(/\D+/g, '')
              if (digits === '') { setPageText(''); setPage(1); return }
              const v = parseInt(digits, 10)
              if (!Number.isNaN(v)) {
                const clamped = Math.min(Math.max(1, v), totalPages)
                setPage(clamped)
                setPageText(String(clamped))
              }
            }}
            onBlur={() => { if (pageText === '') setPageText('1'); else setPageText(String(page)) }}
            className="w-16 px-2 py-1 ml-1 border bg-white border-gray-300 rounded text-center dark:bg-gray-800 dark:border-gray-700"
          />
          of {totalPages}
        </span>
        <button
          className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700"
          onClick={() => setPage((p) => { const next = Math.min(totalPages, p + 1); setPageText(String(next)); return next })}
          disabled={!canNext}
          aria-label="Next page"
        >Next</button>
        <button
          className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700"
          onClick={() => { setPage(totalPages); setPageText(String(totalPages)) }}
          disabled={!canNext}
          aria-label="Last page"
        >Last</button>
      </div>
    </div>
  )

  return (
    <>
      {/* Search & Sort Controls */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            const raw = e.target.value
            const sanitized = raw.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 20)
            setSearch(sanitized)
          }}
          maxLength={20}
          inputMode="text"
          pattern="[A-Za-z0-9 ]*"
          placeholder="Search by Name, City or Age"
          className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
          aria-label="Search citizens"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Sort:</label>
          <select
            aria-label="Sort key"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as 'id' | 'name' | 'age' | 'city')}
            className="px-2 py-1 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="city">City</option>
          </select>
          <button
            type="button"
            aria-label="Toggle sort direction"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="p-2 text-xs border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDir === 'asc' ? <FaSortAmountDownAlt /> : <FaSortAmountUp />}
          </button>
        </div>
      </div>
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
