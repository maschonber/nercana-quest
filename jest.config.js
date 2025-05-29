// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/frontend/', // Ignore old frontend directory
    '<rootDir>/playwright-tests/' // Ignore Playwright tests
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  reporters: ['default'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  testEnvironment: 'jsdom'
};
