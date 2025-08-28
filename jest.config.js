/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__test__/**/*.+(test|spec).+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/__test__/setup.ts',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__test__/**',
    '!src/index.ts',
    '!src/examples/**',
    '!**/examples/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 60,
      lines: 55,
      statements: 55,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__test__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 10000,
  verbose: true,
};