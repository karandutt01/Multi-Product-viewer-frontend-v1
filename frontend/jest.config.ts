import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      tsconfig: { 
        jsx: 'react-jsx' 
      },
      // CHANGE: Added isolatedModules here instead of globals
      isolatedModules: true
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    "^react-router-dom$": "<rootDir>/node_modules/react-router-dom/dist/index.js",
    // Path mappings to match your tsconfig baseUrl
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "^service/(.*)$": "<rootDir>/src/service/$1",
    "^util/(.*)$": "<rootDir>/src/util/$1",
    "^types/(.*)$": "<rootDir>/src/types/$1",
    "^constants/(.*)$": "<rootDir>/src/constants/$1",
    "^context/(.*)$": "<rootDir>/src/context/$1",
    "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^routes/(.*)$": "<rootDir>/src/routes/$1"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(react-router-dom)/)"
  ],
  resetMocks: true,
  clearMocks: true,
  
  // CHANGE: Updated to exclude index.tsx and reportWebVitals.ts specifically
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx', // CHANGE: Exclude index.tsx
    '!src/reportWebVitals.ts', // CHANGE: Exclude reportWebVitals.ts
    '!src/serviceWorker.ts',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/__test__/**',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/types/**',
    '!src/constants/**',
    '!src/assets/**',
    '!src/**/*.scss',
    '!src/**/*.css'
  ],

  coverageDirectory: '<rootDir>/coverage',
  
  // CHANGE: Added json reporter for debugging
  coverageReporters: ['text', 'lcov', 'html', 'text-summary', 'json'],
  
  // CHANGE: Simplified coverage path ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/public/',
    '/build/',
    '/dist/'
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/__test__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}'
  ]
};

export default config;