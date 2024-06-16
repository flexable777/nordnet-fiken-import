import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		svelte(),
		Icons({ compiler: 'svelte' })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
