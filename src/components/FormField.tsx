// FormField
// Simple labeled field wrapper. Accepts any error-like with an optional message.
// Keeps UI logic minimal and avoids coupling to react-hook-form internals.
type FieldErrorLike = { message?: string }

export default function FormField({
  label,
  error,
  children,
  footerRight,
}: {
  label: string
  error?: FieldErrorLike
  children: React.ReactNode
  footerRight?: React.ReactNode
}) {
  const hasFooter = Boolean(error) || Boolean(footerRight)
  return (
    <label className="block mb-4">
      <div className="mb-1 font-medium">{label}</div>
      {children}
      {hasFooter && (
        <div className="mt-1 flex items-center justify-between">
          <div className="text-sm text-red-600 dark:text-red-400">
            {error?.message}
          </div>
          {footerRight && (
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
              {footerRight}
            </div>
          )}
        </div>
      )}
    </label>
  )
}
