import { defineConfig } from 'vite-plus';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

const ignores = ['.agents/**', 'dist/**', '.vite-hooks/**', '.wrangler/**', 'node_modules/**'];

export default defineConfig({
  plugins: [preact(), tailwindcss(), cloudflare()],
  fmt: {
    ignorePatterns: ignores,
    singleQuote: true,
  },
  lint: {
    ignorePatterns: ignores,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    '*.{js,ts,tsx}': 'vp check --fix',
  },
});
