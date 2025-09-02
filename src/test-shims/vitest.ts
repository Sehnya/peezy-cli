import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Provide a minimal Vitest-compatible shim backed by Jest
const vi = Object.assign(Object.create(null), {
  fn: ((impl?: any) => {
    if (impl) return jest.fn(impl);
    // Default mock implementation returns a successful minimal fetch-like response
    return jest.fn(async () => ({ ok: true, json: async () => [] }));
  }) as unknown as typeof jest.fn,
  mock: jest.mock.bind(jest),
  spyOn: jest.spyOn.bind(jest),
  clearAllMocks: jest.clearAllMocks.bind(jest),
});

export type Mock = jest.Mock;

export { describe, it, expect, beforeEach, vi };
