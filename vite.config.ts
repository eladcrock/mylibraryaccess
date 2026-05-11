import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig as defineViteConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";

const isNetlify = process.env.NETLIFY === "true";
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
type TanStackStartOptions = NonNullable<Parameters<typeof tanstackStart>[0]>;

const tanstackStartOptions: TanStackStartOptions = {
  importProtection: {
    behavior: "error",
    client: {
      files: ["**/server/**"],
      specifiers: ["server-only"],
    },
  },
  server: { entry: "server" },
};

const sharedExternalConfig = {
  resolve: {
    alias: { "@": `${process.cwd()}/src` },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
};

const externalPlugins = [
  tailwindcss(),
  tsConfigPaths({ projects: ["./tsconfig.json"] }),
  tanstackStart(tanstackStartOptions),
  ...(isNetlify ? [netlify()] : []),
  ...(isVercel ? nitro({ preset: "vercel" }) : []),
  viteReact(),
];

const config = isNetlify || isVercel
  ? defineViteConfig({
      ...sharedExternalConfig,
      plugins: externalPlugins,
    })
  : defineLovableConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});

export default config;
