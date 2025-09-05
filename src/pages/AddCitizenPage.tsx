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

const onlyLetters = /^[A-Za-z ]+$/
const onlyDigits = /^\d+$/

const Schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty.')
    .max(20, 'Name cannot be more than 20 characters.')
    .refine((v) => onlyLetters.test(v), { message: 'Name must contain only letters and spaces.' }),
  age: z
    .preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(1, 'Age cannot be empty.'))
    .refine((v) => onlyDigits.test(v as string), { message: 'Age must contain only digits (0-9).' })
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n), { message: 'Age must be a whole number.' })
    .refine((n) => n >= 18, { message: 'Only adults can be added to the list.' })
    .refine((n) => n <= 150, { message: 'Age cannot be more than 150.' }),
  city: z
    .string()
    .trim()
    .min(1, 'City cannot be empty.')
    .max(20, 'City cannot be more than 20 characters.')
    .refine((v) => onlyLetters.test(v), { message: 'City must contain only letters and spaces.' }),
  someNote: z
    .string()
    .trim()
    .min(1, 'Note is required')
    .max(150, 'Note cannot be more than 150 characters.')
    .refine((v) => !/[<>]/.test(v), { message: 'Note cannot contain angle brackets.' })
    .refine((v) => !/(--|;|\/\*|\*\/)/.test(v), { message: 'Note contains disallowed sequences.' }),
})
type FormValues = z.infer<typeof Schema>

export default function AddCitizenPage() {
  const { provider, ensureSepolia, connect, account } = useEthers()
  const [busy, setBusy] = useState(false)
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors, isValid }, reset, setValue } = useForm<z.input<typeof Schema>, unknown, FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (values: FormValues) => {
    if (!provider) return toast.error('MetaMask not detected')
    try {
      setBusy(true)
      await connect()
      await ensureSepolia()
      const freshSigner = await (provider as BrowserProvider).getSigner()
      const contract = getCitizenContract(freshSigner)
      const tx = await contract.addCitizen(values.age, values.city.trim(), values.name.trim(), values.someNote.trim())
      toast.loading('Submitting transaction…', { id: 'tx' })
      await tx.wait()
      toast.success('Citizen added!', { id: 'tx' })
      reset()
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
        You are {account ? <span className="font-medium">connected</span> : <span className="font-medium">not connected</span>}. You'll be prompted in MetaMask on submit.
      </div>

      <FormField label="Name" error={errors.name}>
        <input
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2"
          aria-label="Name"
          maxLength={20}
          pattern="[A-Za-z ]*"
          {...register('name', {
            onChange: (e) => {
              const sanitized = e.target.value.replace(/[^A-Za-z ]/g, '').slice(0, 20)
              setValue('name', sanitized, { shouldValidate: true, shouldDirty: true })
            },
          })}
        />
      </FormField>

      <FormField label="Age" error={errors.age}>
        <input
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2"
          aria-label="Age"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          {...register('age', {
            onChange: (e) => {
              const sanitized = e.target.value.replace(/[^0-9]/g, '').slice(0, 3)
              setValue('age', sanitized as unknown as number, { shouldValidate: true, shouldDirty: true })
            },
          })}
        />
      </FormField>

      <FormField label="City" error={errors.city}>
        <input
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2"
          aria-label="City"
          maxLength={20}
          pattern="[A-Za-z ]*"
          {...register('city', {
            onChange: (e) => {
              const sanitized = e.target.value.replace(/[^A-Za-z ]/g, '').slice(0, 20)
              setValue('city', sanitized, { shouldValidate: true, shouldDirty: true })
            },
          })}
        />
      </FormField>

      <FormField label="Note" error={errors.someNote}>
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded p-2"
          aria-label="Note"
          rows={5}
          maxLength={150}
          {...register('someNote', {
            onChange: (e) => {
              // Basic input sanitation to reduce XSS/SQLi risk: remove angle brackets and common SQL comment/statement tokens
              const raw: string = e.target.value
              const sanitized = raw
                .replace(/[<>]/g, '')
                .replace(/--/g, '')
                .replace(/;+/g, '')
                .replace(/\/\*/g, '')
                .replace(/\*\//g, '')
                .slice(0, 150)
              setValue('someNote', sanitized, { shouldValidate: true, shouldDirty: true })
            },
          })}
        />
      </FormField>

      <button
        disabled={busy || !isValid}
        className="mt-2 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-60"
        type="submit"
      >
        {busy ? 'Submitting…' : 'Add Citizen'}
      </button>
    </form>
  )
}


