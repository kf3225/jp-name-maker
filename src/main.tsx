import { render } from 'preact';
import { useState } from 'preact/hooks';
import type { GenerateInput, Gender, Locale, ToneTag } from './core/schema';
import { detectLocale, t, type LocaleEnv } from './i18n';
import { LocaleProvider, useLocale } from './i18n/preact';
import './styles.css';

/**
 * トグルで切り替え可能なロケール（ADR-0007）。
 */
const LOCALE_OPTIONS: ReadonlyArray<Locale> = ['en', 'ja'];

const TONE_OPTIONS: ReadonlyArray<ToneTag> = ['traditional', 'modern', 'cute', 'cool', 'neutral'];

const GENDER_OPTIONS: ReadonlyArray<Gender> = ['male', 'female', 'neutral'];

interface Candidate {
  readonly kanji: string;
  readonly kana: string;
}

/**
 * ユーザーが選択したエラーコード（ADR-0007 構造化エラー）→ 表示文の写像。
 * 未知 code または非 JSON レスポンスは `error.unknown` にフォールバック（防御的パース）。
 */
const errorMessageFor = (locale: Locale, code: string): string => {
  switch (code) {
    case 'invalid_input':
      return t(locale, 'error.invalid_input');
    case 'generation_failed':
      return t(locale, 'error.generation_failed');
    default:
      return t(locale, 'error.unknown');
  }
};

function App() {
  const { locale, setLocale } = useLocale();
  const [name, setName] = useState('');
  const [roots, setRoots] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [tones, setTones] = useState<ReadonlyArray<ToneTag>>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState('');

  function toggleTone(tone: ToneTag) {
    setTones((cur) => (cur.includes(tone) ? cur.filter((x) => x !== tone) : [...cur, tone]));
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    setError('');
    setCandidate(null);
    const input: GenerateInput = {
      name,
      locale,
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
      // 防御的パース（plan-reviewer 補足#2）: 非 JSON レスポンスや未知 code は error.unknown へ。
      let code = 'unknown';
      try {
        const body = (await res.json()) as { error?: string };
        code = body.error ?? 'unknown';
      } catch {
        code = 'unknown';
      }
      setError(errorMessageFor(locale, code));
      return;
    }
    const data: { candidate: Candidate } = await res.json();
    setCandidate(data.candidate);
  }

  return (
    <main class="container mx-auto p-4 max-w-lg">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">{t(locale, 'app.title')}</h1>
        <div class="join" role="group" aria-label="locale">
          {LOCALE_OPTIONS.map((l) => (
            <button
              key={l}
              type="button"
              class={`btn join-item btn-sm${locale === l ? ' btn-active' : ''}`}
              aria-pressed={locale === l}
              onClick={() => setLocale(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={onSubmit} class="flex flex-col gap-3">
        <input
          class="input input-bordered"
          placeholder={t(locale, 'form.name.placeholder')}
          value={name}
          onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)}
        />
        <textarea
          class="textarea textarea-bordered"
          placeholder={t(locale, 'form.roots.placeholder')}
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
          <option value="">{t(locale, 'form.gender.placeholder')}</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {t(locale, `gender.${g}`)}
            </option>
          ))}
        </select>
        <div>
          <p class="text-sm opacity-70 mb-1">{t(locale, 'form.tone.label')}</p>
          <div class="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((tone) => (
              <label key={tone} class="label cursor-pointer gap-1 flex items-center">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={tones.includes(tone)}
                  onChange={() => toggleTone(tone)}
                />
                <span>{t(locale, `tone.${tone}`)}</span>
              </label>
            ))}
          </div>
        </div>
        <button class="btn btn-primary" type="submit">
          {t(locale, 'form.submit')}
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

const initialEnv: LocaleEnv = {
  navigator: { language: globalThis.navigator?.language ?? '' },
  localStorage: globalThis.localStorage,
};

render(
  <LocaleProvider initial={detectLocale(initialEnv)}>
    <App />
  </LocaleProvider>,
  document.getElementById('app')!,
);
