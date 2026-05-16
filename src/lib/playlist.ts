import type { Card } from './types';

// ── Playlist con shuffle ponderado por frequency ────────────────────────
// HIGH aparece 3 veces más que LOW, MEDIUM 2 veces. Después se baraja
// con Fisher–Yates. El resultado es una lista repetida de IDs (no de
// referencias), porque las cards llegan idénticas a las del input.

const WEIGHT: Record<Card['frequency'], number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function fisherYates<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffleByFrequency(cards: Card[]): Card[] {
  if (cards.length === 0) return [];

  const expanded: Card[] = [];
  for (const c of cards) {
    const w = WEIGHT[c.frequency] ?? 1;
    for (let i = 0; i < w; i++) expanded.push(c);
  }

  // Shuffle. Evitamos que dos copias consecutivas de la misma card
  // queden pegadas haciendo hasta 3 pasadas de re-swap selectivo.
  let shuffled = fisherYates(expanded);
  for (let pass = 0; pass < 3; pass++) {
    let conflicts = 0;
    for (let i = 1; i < shuffled.length; i++) {
      if (shuffled[i].id === shuffled[i - 1].id) {
        conflicts++;
        // intercambiar con un índice "lejano" aleatorio
        const j = (i + 1 + Math.floor(Math.random() * (shuffled.length - 2))) % shuffled.length;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    if (conflicts === 0) break;
  }

  return shuffled;
}
