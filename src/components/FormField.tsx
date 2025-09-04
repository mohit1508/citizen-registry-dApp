// FormField
// Simple labeled field wrapper. Accepts any error-like with an optional message.
// Keeps UI logic minimal and avoids coupling to react-hook-form internals.
type FieldErrorLike = { message?: string }

export default function FormField({
  label, error, children,
}: { label: string; error?: FieldErrorLike; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <div className="mb-1 font-medium">{label}</div>
      {children}
      {error && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</div>}
    </label>
  )
}
