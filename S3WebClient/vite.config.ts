/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { UserConfig as VitestUserConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
} as VitestUserConfig);
