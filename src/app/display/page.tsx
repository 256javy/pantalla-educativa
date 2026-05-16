'use client';
// ── /display — Vista pública TV (carrusel) ───────────────────────────────
import { useMemo, useState } from 'react';
import { useCards } from '@/lib/use-cards';
import { SEED } from '@/lib/seed-data';
import { useWakeLock } from '@/lib/use-wake-lock';
import { shuffleByFrequency } from '@/lib/playlist';
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
  const { cards, loading, error } = useCards({ onlyActive: true });
  const source = !loading && cards.length > 0 ? cards : SEED_WITH_IDS;
  const usingFallback = !loading && cards.length === 0;
  const [zoom, setZoom] = useZoom();
  useWakeLock();

  // shuffleVersion fuerza re-shuffle cuando TVDisplay completa una vuelta.
  const [shuffleVersion, setShuffleVersion] = useState(0);
  const items = useMemo(
    () => shuffleByFrequency(source),
    // shuffleVersion entra como dep para que se re-baraje aunque source no cambie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, shuffleVersion]
  );

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
        <TVDisplay
          items={items}
          tweaks={TWEAKS}
          onLoopComplete={() => setShuffleVersion((v) => v + 1)}
        />
      </div>
      <ZoomControl zoom={zoom} onChange={setZoom} />
      {(error || usingFallback) && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '6px 12px',
            borderRadius: 999,
            background: error ? 'rgba(220, 38, 38, 0.92)' : 'rgba(15, 23, 42, 0.65)',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            opacity: 0.85,
          }}
          title={error ? `${error.name}: ${error.message}` : 'Firestore sin datos'}
        >
          {error ? `Error: ${(error as { code?: string }).code ?? error.name}` : 'Mostrando seed (sin datos en DB)'}
        </div>
      )}
    </div>
  );
}
