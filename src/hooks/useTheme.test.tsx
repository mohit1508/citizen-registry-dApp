/**
 * useTheme.test.tsx
 * Covers initialization from localStorage, applying/removing dark class,
 * color-scheme syncing, toggling, and storage write. Also covers error path.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { useTheme, __testOnly_getInitialTheme, applyTheme } from './useTheme'

function TestComp() {
  const { theme, isDark, toggle } = useTheme()
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="isDark">{String(isDark)}</div>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

describe('useTheme', () => {
  beforeEach(() => {
    // reset DOM state
    document.documentElement.classList.remove('dark')
    ;(document.documentElement as HTMLElement).style.colorScheme = ''
    localStorage.clear()
  })

  it('defaults to light when no localStorage and applies color-scheme', () => {
    render(<TestComp />)
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(screen.getByTestId('isDark').textContent).toBe('false')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect((document.documentElement as HTMLElement).style.colorScheme).toBe('light')
  })

  it('initializes from localStorage and toggles, persisting setting', () => {
    localStorage.setItem('theme', 'dark')
    render(<TestComp />)
    // starts dark
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect((document.documentElement as HTMLElement).style.colorScheme).toBe('dark')
    // toggle -> light
    fireEvent.click(screen.getByText('toggle'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect((document.documentElement as HTMLElement).style.colorScheme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('falls back to light if localStorage.getItem throws', () => {
    const original = localStorage.getItem
    localStorage.getItem = () => { throw new Error('fail') }
    render(<TestComp />)
    expect(screen.getByTestId('theme').textContent).toBe('light')
    // restore
    localStorage.getItem = original
  })

  it('does not crash if localStorage.setItem throws', () => {
    const ls = localStorage as unknown as { setItem: (key: string, value: string) => void }
    const original = ls.setItem
    ls.setItem = () => { throw new Error('boom') }
    render(<TestComp />)
    // toggle to trigger write
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme').textContent).toMatch(/dark|light/)
    // restore
    ls.setItem = original
  })

  it('test helper covers window undefined branch in initializer', () => {
    const g = globalThis as unknown as { window?: Window }
    const originalWindow = g.window
    g.window = undefined
    expect(__testOnly_getInitialTheme()).toBe('light')
    g.window = originalWindow
  })

  it('applyTheme toggles html.dark class both ways', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
