import { env } from '../env'

export const SEPOLIA = {
  chainIdHex: (env.VITE_CHAIN_ID as `0x${string}`) || '0xAA36A7',
  chainId: 11155111,
  chainName: 'Ethereum Sepolia',
  rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
  nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
}
