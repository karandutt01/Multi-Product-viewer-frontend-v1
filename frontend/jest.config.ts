import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/frontend/src'],
  setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
     "^react-router-dom$": "<rootDir>/node_modules/react-router-dom/dist/index.js"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(react-router-dom)/)"
  ],
  resetMocks: true,
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/serviceWorker.ts',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/types/**',
    '!src/constants/**',
    '!src/assets/**',
    '!src/**/*.scss',
    '!src/**/*.css',
    'src/service/authService.ts',
    '!src/service/**',
  ],
  
  // Ignore these paths completely
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/public/',
    '/build/',
    '/dist/',
    '/__tests__/',
    '/test-utils/',
    '/mocks/'
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config;