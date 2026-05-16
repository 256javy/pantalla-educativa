'use client';
// ── /variants — Vista de variantes lado a lado ───────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import { SEED } from '@/lib/seed-data';
import { CARD_VARIANTS } from '@/components/CardRenderer';
import CardRenderer from '@/components/CardRenderer';
import type { Card } from '@/lib/types';

// Seed with IDs
const SEED_WITH_IDS: Card[] = SEED.map((card, i) => ({
  ...card,
  id: `c-${i + 1}`,
}));

function variantUsedBy(id: string): string {
  switch (id) {
    case 'classic': return 'fallback';
    case 'editorial': return 'Historia';
    case 'magazine': return 'Frases';
    case 'quiz': return 'Quiz';
    case 'mosaic': return 'Humor';
    case 'aurora': return 'Ciencia';
    default: return '—';
  }
}

const samples: Record<string, Card | undefined> = {
  classic: SEED_WITH_IDS.find((x) => x.type === 'FACT'),
  editorial: SEED_WITH_IDS.find((x) => x.type === 'HISTORY'),
  magazine: SEED_WITH_IDS.find((x) => x.type === 'QUOTE'),
  quiz: SEED_WITH_IDS.find((x) => x.type === 'QUIZ'),
  mosaic: SEED_WITH_IDS.find((x) => x.type === 'HUMOR'),
  aurora: SEED_WITH_IDS.find((x) => x.type === 'FACT' && x.id === 'c-9'),
};

interface VariantThumbProps {
  variant: { id: string; label: string };
  item: Card;
}

function VariantThumb({ variant, item }: VariantThumbProps) {
  const W = 1920, H = 1080;
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.32);
  const cat = CATEGORIES[item.type];

  useEffect(() => {
    if (!containerRef) return;
    const ro = new ResizeObserver(([e]) => {
      setScale(e.contentRect.width / W);
    });
    ro.observe(containerRef);
    return () => ro.disconnect();
  }, [containerRef]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        ref={setContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 16,
          overflow: 'hidden',
          background: cat.bg,
          boxShadow: '0 1px 0 rgba(15,23,42,0.04), 0 20px 40px -28px rgba(15,23,42,0.25)',
          border: '1px solid rgba(15,23,42,0.06)',
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
          <CardRenderer
            variant={variant.id}
            item={item}
            cat={cat}
            progress={0.55}
            quizState={item.type === 'QUIZ' ? 'question' : null}
            quizProgress={0.55}
            quizSeconds={7}
            fontScale={1}
          />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#94A3B8', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
        }}>
          {variant.id}
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{variant.label}</span>
        <span style={{ fontSize: 13, color: '#64748B' }}>· por defecto: {variantUsedBy(variant.id)}</span>
      </div>
    </div>
  );
}

export default function VariantsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        overflow: 'auto',
        background: '#F1F5F9',
        padding: '40px 48px 80px',
      }}
    >
      <header style={{ maxWidth: 1400, margin: '0 auto 32px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>
          Sistema de tarjetas
        </div>
        <h1 style={{ margin: '6px 0 8px', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Seis variantes para mostrar contenido en TV
        </h1>
        <p style={{ margin: 0, color: '#475569', fontSize: 15, maxWidth: 720, lineHeight: 1.55, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Cada categoría tiene un layout por defecto. El motor del display las rota según el tipo de contenido.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 32,
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {CARD_VARIANTS.map((v) => {
          const item = samples[v.id] || SEED_WITH_IDS[0];
          return (
            <VariantThumb key={v.id} variant={v} item={item} />
          );
        })}
      </div>
    </div>
  );
}
