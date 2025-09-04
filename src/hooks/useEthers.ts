// useEthers
// Centralized EIP-1193/Ethers integration for MetaMask.
// - Exposes provider/signer/account/chainId and readiness state
// - Subscribes to `accountsChanged` and `chainChanged`
// - Provides helpers to connect and ensure the Sepolia network
// Notes:
// - `ensureSepolia` will attempt to switch and, if missing, add the network
// - This hook avoids optional chaining after existence guards for stricter typing
import { useEffect, useMemo, useState } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import type { Eip1193Provider } from 'ethers'
import { SEPOLIA } from '../utils/sepolia'

declare global {
  interface EthereumProvider extends Eip1193Provider {
    on(event: 'accountsChanged', listener: (accounts: string[]) => void): void
    on(event: 'chainChanged', listener: (chainId: string) => void): void
    removeListener(event: 'accountsChanged', listener: (accounts: string[]) => void): void
    removeListener(event: 'chainChanged', listener: (chainId: string) => void): void
  }
  interface Window {
    ethereum?: EthereumProvider
  }
}

function hasCode(x: unknown): x is { code: number } {
  return (
    typeof x === 'object' &&
    x !== null &&
    'code' in x &&
    typeof (x as { code?: unknown }).code === 'number'
  )
}

export function useEthers() {
  // BrowserProvider: wraps the injected EIP-1193 provider (MetaMask)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  // Signer: set on-demand when user connects
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  // Checksummed address of the connected account
  const [account, setAccount] = useState<string | null>(null)
  // Decoded numeric chain ID (e.g., 11155111 for Sepolia)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    if (!window.ethereum) return

    const p = new BrowserProvider(window.ethereum)
    setProvider(p)

    const handleAccounts = (accs: string[] | undefined) => setAccount(accs?.[0] ?? null)
    const handleChain = (hexId: string) => setChainId(parseInt(hexId, 16))

    // Initialize with current wallet/account + chain
    void window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accs) => handleAccounts(accs as string[]))
    void window.ethereum
      .request({ method: 'eth_chainId' })
      .then((hex) => handleChain(hex as string))

    window.ethereum.on('accountsChanged', handleAccounts)
    window.ethereum.on('chainChanged', handleChain)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccounts)
      window.ethereum?.removeListener('chainChanged', handleChain)
    }
  }, [])

  const connect = async () => {
    // Requests account access and populates signer/account/chainId
    if (!window.ethereum) throw new Error('MetaMask not found')
    // Ensure we always use a fresh BrowserProvider after any potential network changes
    const freshProvider = new BrowserProvider(window.ethereum)
    setProvider(freshProvider)
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const s = await freshProvider.getSigner()
    setSigner(s)
    const addr = await s.getAddress()
    setAccount(addr)
    const net = await freshProvider.getNetwork()
    setChainId(Number(net.chainId))
  }

  const ensureSepolia = async () => {
    // Attempts to switch to Sepolia; if the chain is unknown in the wallet,
    // adds it with relevant RPC and explorer config. No-op if already on Sepolia.
    if (!window.ethereum) throw new Error('MetaMask not found')
    const currentHex = await window.ethereum.request({ method: 'eth_chainId' })
    if (typeof currentHex === 'string' && currentHex.toLowerCase() === SEPOLIA.chainIdHex.toLowerCase()) {
      return
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA.chainIdHex }],
      })
    } catch (err: unknown) {
      if (hasCode(err) && err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA.chainIdHex,
            chainName: SEPOLIA.chainName,
            rpcUrls: SEPOLIA.rpcUrls,
            nativeCurrency: SEPOLIA.nativeCurrency,
            blockExplorerUrls: SEPOLIA.blockExplorerUrls,
          }],
        })
      } else {
        throw err
      }
    }
    // After a successful switch/add, refresh provider network and state
    const freshProvider = new BrowserProvider(window.ethereum)
    setProvider(freshProvider)
    const net = await freshProvider.getNetwork()
    setChainId(Number(net.chainId))
    if (account) {
      try {
        const s = await freshProvider.getSigner()
        setSigner(s)
      } catch {
        // not connected yet; ignore
      }
    }
  }

  const ready = useMemo(() => Boolean(provider), [provider])

  return { ready, provider, signer, account, chainId, connect, ensureSepolia }
}
