import { jest } from "@jest/globals";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Setup test database or mock services
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});
