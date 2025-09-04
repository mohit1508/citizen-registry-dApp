/**
 * Jest configuration for a Vite + React + TypeScript project.
 * - Uses ts-jest in ESM mode so we can import TS/TSX directly
 * - JSDOM environment for React component tests
 * - Mappers for CSS and static assets
 * - 100% coverage thresholds enforced
 */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: 'tsconfig.app.json', useESM: true, isolatedModules: true },
    ],
  },
  moduleNameMapper: {
    // Map CSS (global or modules) to a simple mock
    '\\.(css|less|scss|sass)$': '<rootDir>/test/__mocks__/styleMock.js',
    // Map common static assets to a stub so imports don't break
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/vite-env.d.ts',
    '!src/abi/*.json',
    '!src/index.css',
    '!src/styles.css',
  ],
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
}
