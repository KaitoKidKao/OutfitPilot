import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/setup.ts"],
    // Restore env after each test (pairs with vi.stubEnv in test/setup.ts).
    unstubEnvs: true,
  },
});
