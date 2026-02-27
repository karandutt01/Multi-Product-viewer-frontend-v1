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
};

export default config;