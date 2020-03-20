module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  testRunner: 'jest-circus/runner',
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  clearMocks: true,
  collectCoverage: false,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 75,
      statements: 75
    },
    './src/*.ts': {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/*.js': {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/tests/**/*.ts': {
      branches: 50,
      functions: 60,
      lines: 65,
      statements: 65
    },
    './src/tests/**/*.js': {
      branches: 50,
      functions: 60,
      lines: 65,
      statements: 65
    }
  }
}
