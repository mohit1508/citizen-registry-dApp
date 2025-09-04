import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import CitizensListPage from '../pages/CitizenListPage'
import AddCitizenPage from '../pages/AddCitizenPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/citizens" replace /> },
      { path: '/citizens', element: <CitizensListPage /> },
      { path: '/add', element: <AddCitizenPage /> },
    ],
  },
])
// App router
// Defines application routes and lazy-loading boundaries as needed.
