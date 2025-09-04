/**
 * queryClient.test.ts
 * Smoke check: importing the client should succeed.
 * This covers construction and default options evaluation.
 */
import { queryClient } from './queryClient'
import { QueryClient } from '@tanstack/react-query'

describe('queryClient', () => {
  it('exports a QueryClient instance', () => {
    expect(queryClient).toBeInstanceOf(QueryClient)
  })
})

