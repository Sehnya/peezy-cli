declare module "vitest" {
  import type { Mock } from "jest-mock";
  import { describe, it, expect, beforeEach, jest } from "@jest/globals";

  const vi: {
    fn: typeof jest.fn;
    mock: typeof jest.mock;
    spyOn: typeof jest.spyOn;
    clearAllMocks: typeof jest.clearAllMocks;
  };

  export { describe, it, expect, beforeEach, vi };
  export type { Mock };
}
