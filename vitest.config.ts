import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "client/src/**/*.test.ts",
      "client/src/**/*.test.tsx",
      "server/src/**/*.test.ts",
    ],
    environment: "node",
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "client/src/**/*.{ts,tsx}",
        "server/src/**/*.ts",
      ],
      exclude: [
        "**/*.test.*",
        "client/src/main.tsx",
        "client/src/App.tsx",
        "client/src/vite-env.d.ts",
        "client/src/types/**",
        "server/src/index.ts",
        "server/src/db/prisma.ts",
      ],
    },
  },
});
