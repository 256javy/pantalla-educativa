'use client';
// ── /display — Vista pública TV (carrusel) ───────────────────────────────
import React, { useState } from 'react';
import { useCards } from '@/lib/use-cards';
import { SEED } from '@/lib/seed-data';
import TVDisplay, { type TVTweaks } from '@/components/TVDisplay';
import TweaksPanel, { useTweaks, TweakSection, TweakSlider, TweakRadio } from '@/components/TweaksPanel';
import type { Card } from '@/lib/types';

const TWEAK_DEFAULTS: TVTweaks = {
  rotationSeconds: 22,
  fontScale: 1.0,
  demoMode: 'auto',
  palette: 'cream',
};

// Seed data with IDs for fallback
const SEED_WITH_IDS: Card[] = SEED.map((card, i) => ({
  ...card,
  id: `c-${i + 1}`,
}));

function DisplayContent() {
  const { cards, loading } = useCards({ onlyActive: true });
  const [tweaks, setTweak] = useTweaks<TVTweaks>(TWEAK_DEFAULTS);

  // Use Firestore cards if available, fallback to seed
  const items = (!loading && cards.length > 0) ? cards : SEED_WITH_IDS;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0E13', display: 'grid', placeItems: 'center' }}>
      <TVScaler>
        <TVDisplay items={items} tweaks={tweaks} />
      </TVScaler>

      <TweaksPanel title="Pantalla">
        <TweakSection label="Rotación" />
        <TweakSlider
          label="Velocidad"
          value={tweaks.rotationSeconds}
          min={8} max={60} step={1} unit=" s"
          onChange={(v) => setTweak('rotationSeconds', v)}
        />
        <TweakSlider
          label="Escala de tipo"
          value={Math.round(tweaks.fontScale * 100)}
          min={70} max={140} step={5} unit="%"
          onChange={(v) => setTweak('fontScale', v / 100)}
        />
        <TweakSection label="Modo" />
        <TweakRadio
          label="Demo"
          value={tweaks.demoMode}
          options={['auto', 'manual']}
          onChange={(v) => setTweak('demoMode', v as 'auto' | 'manual')}
        />
        <TweakSection label="Tema" />
        <TweakRadio
          label="Paleta"
          value={tweaks.palette}
          options={['cream', 'dark', 'sepia']}
          onChange={(v) => setTweak('palette', v as 'cream' | 'dark' | 'sepia')}
        />
      </TweaksPanel>
    </div>
  );
}

// 1920×1080 envoltorio que escala al contenedor disponible
function TVScaler({ children }: { children: React.ReactNode }) {
  const W = 1920, H = 1080;
  const [size, setSize] = React.useState({ w: 1200, h: 700 });
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min((size.w - 64) / W, (size.h - 64) / H);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: W * scale,
          height: H * scale,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 30px 80px -30px rgba(15,23,42,0.35), 0 1px 0 rgba(15,23,42,0.06)',
          background: '#000',
        }}
      >
        <div
          style={{
            position: 'absolute', top: 0, left: 0,
            width: W, height: H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DisplayPage() {
  return <DisplayContent />;
}
