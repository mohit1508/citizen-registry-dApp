/**
 * ThemeToggle.test.tsx
 * Ensures aria labels/pressed state reflect theme and toggle works.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from './ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => { localStorage.clear(); document.documentElement.classList.remove('dark') })

  it('reflects dark mode from storage and toggles label/state', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-label', 'Switch to light theme')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-label', 'Switch to dark theme')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })
})

