// AddCitizenPage
// Form-driven page to submit a new citizen via the contract.
// Uses Zod for validation and React Query to invalidate listing on success.
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormField from '../components/FormField'
import { useEthers } from '../hooks/useEthers'
import { getCitizenContract } from '../hooks/useCitizenContract'
import { addLocalCitizen } from '../services/localRegistry'
import { useState } from 'react'
import type { BrowserProvider } from 'ethers'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

const Schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  age: z.coerce.number().int().min(18, 'Must be at least 18').max(150),
  city: z.string().min(1, 'City is required').max(120),
  someNote: z.string().min(1, 'Note is required').max(2000),
})
type FormValues = z.infer<typeof Schema>

export default function AddCitizenPage() {
  const { provider, ensureSepolia, connect, account } = useEthers()
  const [busy, setBusy] = useState(false)
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.input<typeof Schema>, unknown, FormValues>({
    resolver: zodResolver(Schema),
  })

  const onSubmit = async (values: FormValues) => {
    // Ensure a provider before attempting any wallet interaction
    if (!provider) return toast.error('MetaMask not detected')
    try {
      setBusy(true)
      await connect()
      await ensureSepolia()
      // Get a fresh signer after connect to avoid using a plain Provider runner
      const freshSigner = await (provider as BrowserProvider).getSigner()
      const contract = getCitizenContract(freshSigner)
      const tx = await contract.addCitizen(values.age, values.city.trim(), values.name.trim(), values.someNote.trim())
      toast.loading('Submitting transaction…', { id: 'tx' })
      await tx.wait()
      toast.success('Citizen added!', { id: 'tx' })
      reset()
      // refresh list
      qc.invalidateQueries({ queryKey: ['citizens'] })
    } catch (e: unknown) {
      const code = typeof e === 'object' && e && 'code' in e ? (e as { code?: string | number }).code : undefined
      const isRejected = code === 'ACTION_REJECTED'
      if (isRejected) {
        addLocalCitizen({ age: values.age, city: values.city.trim(), name: values.name.trim(), someNote: values.someNote.trim() })
        toast.success('Citizen added locally for this session')
        reset()
        qc.invalidateQueries({ queryKey: ['citizens'] })
      } else {
        // Normalize Ethers and wallet errors where possible
        const message =
          typeof e === 'object' && e !== null && 'shortMessage' in e
            ? (e as { shortMessage?: string; message?: string }).shortMessage ?? (e as { message?: string }).message ?? 'Transaction failed'
            : e instanceof Error
              ? e.message
              : 'Transaction failed'
        toast.error(message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg p-4">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        You are {account ? <span className="font-medium">connected</span> : <span className="font-medium">not connected</span>}. You’ll be prompted in MetaMask on submit.
      </div>

      <FormField label="Name" error={errors.name}>
        <input className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2" placeholder="" {...register('name')} />
      </FormField>

      <FormField label="Age" error={errors.age}>
        <input className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2" placeholder="" type="number" {...register('age')} />
      </FormField>

      <FormField label="City" error={errors.city}>
        <input className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2" placeholder="" {...register('city')} />
      </FormField>

      <FormField label="Note" error={errors.someNote}>
        <textarea className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2" rows={5} placeholder="" {...register('someNote')} />
      </FormField>

      <button
        disabled={busy}
        className="mt-2 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-60"
        type="submit"
      >
        {busy ? 'Submitting…' : 'Add Citizen'}
      </button>
    </form>
  )
}
