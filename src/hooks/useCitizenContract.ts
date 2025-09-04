// Citizen contract helpers
// - getCitizenInterface: returns typed Interface for the ABI
// - getCitizenContract: returns a Contract bound to a Provider (read) or Signer (write)
// Keep ABI typing strict to avoid `any` leaks and enable better tooling.
import { Contract, Interface, JsonRpcSigner } from 'ethers'
import type { InterfaceAbi, Provider } from 'ethers'
import abi from '../abi/testTaskABI.json'
import { env } from '../env'

const CONTRACT_ADDRESS = env.VITE_CONTRACT_ADDRESS as string

export function getCitizenInterface() {
  // Treat imported ABI JSON as InterfaceAbi for Ethers v6
  const citizenAbi = abi as unknown as InterfaceAbi
  return new Interface(citizenAbi)
}

export function getCitizenContract(providerOrSigner: Provider | JsonRpcSigner) {
  // Constructs an instance for read/write depending on runner type.
  const citizenAbi = abi as unknown as InterfaceAbi
  return new Contract(CONTRACT_ADDRESS, citizenAbi, providerOrSigner)
}
