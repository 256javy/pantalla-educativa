'use client';
// ── /display — Vista pública TV (carrusel) ───────────────────────────────
import { useCards } from '@/lib/use-cards';
import { SEED } from '@/lib/seed-data';
import { useWakeLock } from '@/lib/use-wake-lock';
import TVDisplay, { type TVTweaks } from '@/components/TVDisplay';
import ZoomControl, { useZoom } from '@/components/ZoomControl';
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
  const [zoom, setZoom] = useZoom();
  useWakeLock(); // mantiene la pantalla del dispositivo encendida

  // El "viewport interno" se simula agrandando el wrapper inversamente
  // al zoom y luego escalándolo. zoom < 1 → más espacio interno (más cabe);
  // zoom > 1 → menos espacio (texto más grande). El overflow del padre
  // mantiene la card recortada al viewport real del browser.
  const inv = 1 / zoom;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F8F9FA', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${inv * 100}%`,
          height: `${inv * 100}%`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        <TVDisplay items={items} tweaks={TWEAKS} />
      </div>
      <ZoomControl zoom={zoom} onChange={setZoom} />
    </div>
  );
}
