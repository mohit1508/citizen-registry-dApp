// ConnectButton
// Handles wallet connection flow and surfaces basic status.
// On success, ensures Sepolia and shows a short-account display.
import { useState } from 'react'
import { useEthers } from '../hooks/useEthers'
import toast from 'react-hot-toast'

export default function ConnectButton() {
  const { connect, ensureSepolia, account } = useEthers()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    try {
      setBusy(true)
      await connect()
      await ensureSepolia()
      toast.success('Wallet connected')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to connect'
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  if (account) {
    const short = `${account.slice(0, 6)}…${account.slice(-4)}`
    return (
      <button className="px-3 py-2 rounded-md bg-sky-50 text-sky-900 border border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800">
        {short}
      </button>
    )
  }

  return (
    <button
      disabled={busy}
      onClick={onClick}
      className="px-3 py-2 rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
    >
      {busy ? 'Connecting…' : 'Connect MetaMask'}
    </button>
  )
}

