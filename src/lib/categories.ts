// ── Pantalla Educativa · paleta por categoría + helpers ─────────────────
import type { CardType, Category, Frequency } from './types';

export const CATEGORIES: Record<CardType, Category> = {
  FACT: {
    key: 'FACT',
    label: 'Ciencia',
    bg: '#ECFDF5',
    accent: '#059669',
    accentSoft: '#A7F3D0',
    ink: '#064E3B',
    glyph: 'atom',
  },
  HISTORY: {
    key: 'HISTORY',
    label: 'Historia',
    bg: '#EFF6FF',
    accent: '#2563EB',
    accentSoft: '#BFDBFE',
    ink: '#1E3A8A',
    glyph: 'scroll',
  },
  QUOTE: {
    key: 'QUOTE',
    label: 'Frase',
    bg: '#FFF1F2',
    accent: '#E11D48',
    accentSoft: '#FECDD3',
    ink: '#881337',
    glyph: 'quote',
  },
  QUIZ: {
    key: 'QUIZ',
    label: 'Quiz',
    bg: '#F5F3FF',
    accent: '#7C3AED',
    accentSoft: '#DDD6FE',
    ink: '#4C1D95',
    glyph: 'spark',
  },
  HUMOR: {
    key: 'HUMOR',
    label: 'Humor',
    bg: '#FEFCE8',
    accent: '#CA8A04',
    accentSoft: '#FEF08A',
    ink: '#713F12',
    glyph: 'smile',
  },
};

export const FREQ_LABEL: Record<Frequency, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
};

export const FREQ_BARS: Record<Frequency, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export function splitHighlighted(text: string): Array<{ k: 'plain' | 'hi'; t: string }> {
  const out: Array<{ k: 'plain' | 'hi'; t: string }> = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ k: 'plain', t: text.slice(last, m.index) });
    out.push({ k: 'hi', t: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ k: 'plain', t: text.slice(last) });
  return out;
}
