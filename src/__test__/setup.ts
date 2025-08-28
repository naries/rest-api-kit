// Global test setup for Jest
import 'jest-fetch-mock';

// Mock console.warn for cleaner test output
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (message: string, ...args: any[]) => {
    if (
      message.includes('React.createFactory') ||
      message.includes('componentWillReceiveProps') ||
      message.includes('componentWillMount')
    ) {
      return;
    }
    originalWarn(message, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

// Global test utilities
global.TestUtils = {
  // Helper to create mock responses
  mockResponse: (data: any, status: number = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  }),

  // Helper to wait for async operations
  waitFor: (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create test data
  createTestData: (overrides = {}) => ({
    id: 1,
    name: 'Test Item',
    createdAt: '2023-01-01T00:00:00Z',
    ...overrides,
  }),
};

// Set up fetch mock
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// Reset mocks before each test
beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

// Global type declarations for test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }

  var TestUtils: {
    mockResponse: (data: any, status?: number) => any;
    waitFor: (ms?: number) => Promise<void>;
    createTestData: (overrides?: any) => any;
  };
}

// Custom Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
