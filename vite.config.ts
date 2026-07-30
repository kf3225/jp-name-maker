import { defineConfig } from 'vite-plus';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';

const ignores = ['.agents/**', 'dist/**', '.vite-hooks/**', '.wrangler/**', 'node_modules/**'];

// Cloudflare Vite plugin はビルド/開発時のみ。テスト時は除外しないと
// ワーカー環境の resolve.external が Vitest と競合して起動できない。
export default defineConfig(({ mode }) => ({
  plugins: [preact(), tailwindcss(), ...(mode === 'test' ? [] : [cloudflare()])],
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
}));
