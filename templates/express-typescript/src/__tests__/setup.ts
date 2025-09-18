import { config } from '@/config/environment'

// Test setup file
beforeAll(() => {
  // Set test environment
  process.env['NODE_ENV'] = 'test'
  process.env['LOG_LEVEL'] = 'error' // Reduce log noise in tests
})

afterAll(() => {
  // Cleanup after all tests
})

// Global test utilities
export const testConfig = {
  timeout: 10000,
  baseUrl: `http://localhost:${config.port}`,
}

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
