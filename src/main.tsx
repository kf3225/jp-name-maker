import { render } from 'preact';
import { useState } from 'preact/hooks';
import type { GenerateInput } from './core/schema';
import './styles.css';

function App() {
  const [name, setName] = useState('');
  const [roots, setRoots] = useState('');
  const [result, setResult] = useState('');

  async function onSubmit(e: Event) {
    e.preventDefault();
    const input: GenerateInput = { name, ...(roots ? { roots } : {}) };
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    setResult(res.ok ? JSON.stringify(await res.json()) : 'error');
  }

  return (
    <main class="container mx-auto p-4 max-w-lg">
      <h1 class="text-2xl font-bold mb-4">jp-name-maker</h1>
      <form onSubmit={onSubmit} class="flex flex-col gap-2">
        <input
          class="input input-bordered"
          placeholder="名前 (例: John Smith)"
          value={name}
          onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)}
        />
        <textarea
          class="textarea textarea-bordered"
          placeholder="ルーツ（任意）"
          value={roots}
          onInput={(e) => setRoots((e.currentTarget as HTMLTextAreaElement).value)}
        />
        <button class="btn btn-primary" type="submit">
          生成
        </button>
      </form>
      {result && <pre class="mt-4 bg-base-200 p-2 rounded">{result}</pre>}
    </main>
  );
}

render(<App />, document.getElementById('app')!);
