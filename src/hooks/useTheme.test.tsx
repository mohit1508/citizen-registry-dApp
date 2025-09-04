/**
 * useTheme.test.tsx
 * Covers initialization from localStorage, applying/removing dark class,
 * color-scheme syncing, toggling, and storage write. Also covers error path.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
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
    // @ts-expect-error force throw
    localStorage.getItem = () => { throw new Error('fail') }
    render(<TestComp />)
    expect(screen.getByTestId('theme').textContent).toBe('light')
    // restore
    localStorage.getItem = original
  })

  it('does not crash if localStorage.setItem throws', () => {
    const original = localStorage.setItem
    ;(localStorage as any).setItem = () => { throw new Error('boom') }
    render(<TestComp />)
    // toggle to trigger write
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme').textContent).toMatch(/dark|light/)
    // restore
    ;(localStorage as any).setItem = original
  })

  it('test helper covers window undefined branch in initializer', () => {
    const originalWindow = (globalThis as any).window
    ;(globalThis as any).window = undefined
    expect(__testOnly_getInitialTheme()).toBe('light')
    ;(globalThis as any).window = originalWindow
  })

  it('applyTheme toggles html.dark class both ways', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
