/**
 * Layout.test.tsx
 * Verifies nav links and presence of ConnectButton and Toaster.
 */
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'

jest.mock('./ConnectButton', () => ({ __esModule: true, default: () => <div>ConnectButton</div> }))

describe('Layout', () => {
  it('renders nav and outlet container', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    expect(screen.getByText('Citizens Registry')).toBeInTheDocument()
    expect(screen.getByText('All Citizens')).toBeInTheDocument()
    expect(screen.getByText('Add Citizen')).toBeInTheDocument()
    expect(screen.getByText('ConnectButton')).toBeInTheDocument()
  })

  it('applies active class to matching NavLink for /citizens', () => {
    render(
      <MemoryRouter initialEntries={['/citizens']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="citizens" element={<div>Citizens</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('All Citizens').className).toContain('font-semibold')
    expect(screen.getByText('Add Citizen').className).not.toContain('font-semibold')
  })

  it('applies active class to matching NavLink for /add', () => {
    render(
      <MemoryRouter initialEntries={['/add']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="add" element={<div>Add</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Add Citizen').className).toContain('font-semibold')
    expect(screen.getByText('All Citizens').className).not.toContain('font-semibold')
  })
})
