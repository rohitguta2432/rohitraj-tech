/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      jsx: 'react-jsx',
    }],
  },
  moduleNameMapper: {
    '\\.(webp|png|jpe?g|gif|avif|svg)$': '<rootDir>/test/imageStub.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = config;
