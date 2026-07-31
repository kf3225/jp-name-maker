import { describe, it, expect } from 'vitest';
import { buildGivenNamePrompt } from './generate';

describe('buildGivenNamePrompt', () => {
  it('includes the input name in the user message', () => {
    const { messages } = buildGivenNamePrompt({ name: 'John' });
    const user = messages.find((m) => m.role === 'user');
    expect(user?.content).toContain('John');
  });

  it('emits a system and a user message', () => {
    const { messages } = buildGivenNamePrompt({ name: 'A' });
    expect(messages.map((m) => m.role)).toEqual(['system', 'user']);
  });

  it('reflects selected tones in the system prompt', () => {
    const { messages } = buildGivenNamePrompt({ name: 'John', tone: ['cute', 'cool'] });
    const system = messages.find((m) => m.role === 'system');
    expect(system?.content).toContain('かわいい');
    expect(system?.content).toContain('かっこいい');
  });

  it('falls back to a free/varied tone line when none selected', () => {
    const { messages } = buildGivenNamePrompt({ name: 'John' });
    const system = messages.find((m) => m.role === 'system');
    expect(system?.content).toContain('自由');
  });

  it('reflects gender in the system prompt', () => {
    const { messages } = buildGivenNamePrompt({ name: 'John', gender: 'male' });
    const system = messages.find((m) => m.role === 'system');
    expect(system?.content).toContain('男性寄り');
  });

  it('omits the gender line when gender is absent', () => {
    const { messages } = buildGivenNamePrompt({ name: 'John' });
    const system = messages.find((m) => m.role === 'system');
    expect(system?.content).not.toContain('性別の響き');
  });
});
