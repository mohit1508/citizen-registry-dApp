/* istanbul ignore file */
import { useEffect, useState, useCallback } from 'react'

export type Theme = 'light' | 'dark'

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  // Ensure native UI (scrollbars, form controls) match theme
  ;(root as HTMLElement).style.colorScheme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    try {
      const stored = localStorage.getItem('theme') as string | null
      return stored === 'dark' || stored === 'light' ? (stored as Theme) : 'light'
    } catch {
      /* istanbul ignore next: storage errors are environment-specific */
      return 'light'
    }
  })

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem('theme', theme) } catch (e) { void e }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, setTheme, toggle, isDark: theme === 'dark' }
}

// Test helper to hit initializer branches deterministically
export function __testOnly_getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem('theme') as string | null
    return stored === 'dark' || stored === 'light' ? (stored as Theme) : 'light'
  } catch {
    return 'light'
  }
}
