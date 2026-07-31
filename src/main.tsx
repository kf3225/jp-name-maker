import { render } from 'preact';
import { useState } from 'preact/hooks';
import type { GenerateInput, ToneTag, Gender } from './core/schema';
import './styles.css';

const TONE_OPTIONS: ReadonlyArray<{ readonly value: ToneTag; readonly label: string }> = [
  { value: 'traditional', label: '伝統的' },
  { value: 'modern', label: '現代的' },
  { value: 'cute', label: 'かわいい' },
  { value: 'cool', label: 'かっこいい' },
  { value: 'neutral', label: '中性的' },
];

const GENDER_OPTIONS: ReadonlyArray<{ readonly value: Gender; readonly label: string }> = [
  { value: 'male', label: '男性寄り' },
  { value: 'female', label: '女性寄り' },
  { value: 'neutral', label: '中性的' },
];

interface Candidate {
  readonly kanji: string;
  readonly kana: string;
}

function App() {
  const [name, setName] = useState('');
  const [roots, setRoots] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [tones, setTones] = useState<ReadonlyArray<ToneTag>>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState('');

  function toggleTone(tone: ToneTag) {
    setTones((cur) => (cur.includes(tone) ? cur.filter((t) => t !== tone) : [...cur, tone]));
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    setError('');
    setCandidate(null);
    const input: GenerateInput = {
      name,
      ...(gender ? { gender } : {}),
      ...(tones.length > 0 ? { tone: [...tones] } : {}),
      ...(roots ? { roots } : {}),
    };
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      setError('生成に失敗しました。入力を見直してください。');
      return;
    }
    const data: { candidate: Candidate } = await res.json();
    setCandidate(data.candidate);
  }

  return (
    <main class="container mx-auto p-4 max-w-lg">
      <h1 class="text-2xl font-bold mb-4">jp-name-maker</h1>
      <form onSubmit={onSubmit} class="flex flex-col gap-3">
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
        <select
          class="select select-bordered"
          value={gender}
          onChange={(e) => {
            const v = (e.currentTarget as HTMLSelectElement).value;
            setGender(v === '' ? '' : (v as Gender));
          }}
        >
          <option value="">性別（任意）</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <div>
          <p class="text-sm opacity-70 mb-1">雰囲気（任意・複数可）</p>
          <div class="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((t) => (
              <label key={t.value} class="label cursor-pointer gap-1 flex items-center">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={tones.includes(t.value)}
                  onChange={() => toggleTone(t.value)}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </div>
        <button class="btn btn-primary" type="submit">
          生成
        </button>
      </form>
      {candidate && (
        <div class="mt-4 p-4 bg-base-200 rounded text-center">
          <span class="text-3xl font-bold">{candidate.kanji}</span>
          <span class="ml-2 text-lg text-base-content/70">（{candidate.kana}）</span>
        </div>
      )}
      {error && <p class="mt-4 text-error">{error}</p>}
    </main>
  );
}

render(<App />, document.getElementById('app')!);
