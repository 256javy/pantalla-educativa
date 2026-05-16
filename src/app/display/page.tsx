'use client';
// ── /display — Vista pública TV (carrusel) ───────────────────────────────
import { useCards } from '@/lib/use-cards';
import { SEED } from '@/lib/seed-data';
import TVDisplay, { type TVTweaks } from '@/components/TVDisplay';
import type { Card } from '@/lib/types';

const TWEAKS: TVTweaks = {
  rotationSeconds: 22,
  fontScale: 1.0,
  demoMode: 'auto',
  palette: 'cream',
};

const SEED_WITH_IDS: Card[] = SEED.map((card, i) => ({ ...card, id: `c-${i + 1}` }));

export default function DisplayPage() {
  const { cards, loading } = useCards({ onlyActive: true });
  const items = !loading && cards.length > 0 ? cards : SEED_WITH_IDS;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F8F9FA', overflow: 'hidden' }}>
      <TVDisplay items={items} tweaks={TWEAKS} />
    </div>
  );
}
