import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Absolute path: workspace packages (apps/web, packages/*) inherit this file when they run
// their own `vitest run`, and a relative path would resolve against their folder.
export default defineConfig({
  test: {
    setupFiles: [fileURLToPath(new URL("./vitest.setup.ts", import.meta.url))]
  }
});
