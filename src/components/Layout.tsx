// Layout
// Shell component providing navigation and consistent spacing.
// Renders children content within a centered container.
import { Outlet, Link, NavLink } from 'react-router-dom'
import ConnectButton from './ConnectButton'
import ThemeToggle from './ThemeToggle'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <Link to="/citizens" className="flex items-center gap-2 font-bold text-xl text-sky-700 dark:text-sky-400">
            <img src="/logo.png" alt="Citizens Registry logo" className="h-8 w-8 rounded-sm dark:hidden" />
            <img src="/logo-light.png" alt="Citizens Registry logo" className="h-8 w-8 rounded-sm hidden dark:block" />
            <span>Citizens Registry</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden sm:flex gap-4 text-sm">
              <NavLink
                to="/citizens"
                className={({ isActive }) => (
                  (isActive ? 'font-semibold ' : '') +
                  'transition-colors hover:text-cyan-600 dark:hover:text-cyan-400'
                )}
              >
                All Citizens
              </NavLink>
              <NavLink
                to="/add"
                className={({ isActive }) => (
                  (isActive ? 'font-semibold ' : '') +
                  'transition-colors hover:text-cyan-600 dark:hover:text-cyan-400'
                )}
              >
                Add Citizen
              </NavLink>
            </nav>
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
