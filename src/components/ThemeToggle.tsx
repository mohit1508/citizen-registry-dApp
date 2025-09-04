import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className="inline-flex items-center gap-2 p-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <span className="text-lg leading-none" aria-hidden>{isDark ? '🌙' : '☀️'}</span>
    </button>
  )
}

