// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import dotenv from 'dotenv';

const envName = process.env.ENV || "prod";
dotenv.config({ path: `.env.${envName}` });

// https://astro.build/config
export default defineConfig({
	site: "https://micboard.jacksonhorton.dev",
	output: "server", // Enables SSR
	vite: {
		build: {
			sourcemap: false,
			// minify: false,
		},
		optimizeDeps: {
			include: [
				'svelte-headless-table',
				'@lucide/svelte'
			],
		},
		ssr: {
			noExternal: [
				'svelte-headless-table',
				'@lucide/svelte'
			],
			external: ['crypto', 'fs', 'path', 'stream', 'util', 'buffer', 'events']
		}
	},
	integrations: [
		mdx(),        // for MDX support
		sitemap({
			filter: (page) => !page.includes("/dashboard") && !page.includes("/auth"),
		}),           // for generating a sitemap
		svelte(),     // to use Svelte components in Astro
		tailwind()    // to use Tailwind CSS
	],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
