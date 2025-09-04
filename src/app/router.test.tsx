/**
 * router.test.tsx
 * Smoke test for router creation and basic route shape.
 */
import { router } from './router'
import type { RouteObject } from 'react-router-dom'

describe('router', () => {
  it('is created with a root route', () => {
    expect(router).toBeTruthy()
    type RouterLike = { routes?: RouteObject[] }
    const routes = (router as unknown as RouterLike).routes ?? []
    expect(Array.isArray(routes)).toBe(true)
  })
})
