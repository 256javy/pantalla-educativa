'use client';
// ── Pantalla Educativa · Variantes de tarjeta para TV ────────────────────
import React from 'react';
import { splitHighlighted, CATEGORIES } from '@/lib/categories';
import type { Card, Category } from '@/lib/types';
import Icon from './Icon';
import visuals from '@/lib/visual-library.json';

// ── Helpers compartidos ──────────────────────────────────────────────────

interface HighlightedTextProps {
  text: string;
  accent: string;
  style?: React.CSSProperties;
}

function HighlightedText({ text, accent, style }: HighlightedTextProps) {
  const parts = splitHighlighted(text);
  return (
    <span style={style}>
      {parts.map((p, i) =>
        p.k === 'hi' ? (
          <span
            key={i}
            style={{
              color: accent,
              fontWeight: 700,
              animation: 'edu-keyword-pulse 4.2s ease-in-out infinite',
              display: 'inline-block',
            }}
          >
            {p.t}
          </span>
        ) : (
          <React.Fragment key={i}>{p.t}</React.Fragment>
        )
      )}
    </span>
  );
}

interface CategoryBadgeProps {
  cat: Category;
  large?: boolean;
}

function CategoryBadge({ cat, large = false }: CategoryBadgeProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: large ? '12px 22px' : '10px 18px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${cat.accentSoft}`,
        color: cat.accent,
        fontWeight: 600,
        fontSize: large ? '1.8rem' : '1.4rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      <Icon name={cat.glyph} size={large ? 28 : 22} strokeWidth={2} />
      <span>{cat.label}</span>
    </div>
  );
}

interface ProgressBarProps {
  durationMs: number;
  // `slotKey` se aplica al wrapper externo (TVStage) que remontea por slot,
  // así que este componente se monta fresco en cada nueva tarjeta y la
  // animación CSS arranca naturalmente de 0% a 100%.
  accent: string;
  paused?: boolean;
}

function ProgressBar({ durationMs, accent, paused }: ProgressBarProps) {
  return (
    <div
      style={{
        position: 'relative',
        height: 4,
        background: 'rgba(0,0,0,0.06)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '0%',
          background: accent,
          borderRadius: 999,
          opacity: 0.65,
          animationName: 'edu-progress-fill',
          animationDuration: `${durationMs}ms`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </div>
  );
}

interface RefCodeProps {
  code: string;
  color?: string;
}

function RefCode({ code, color = 'currentColor' }: RefCodeProps) {
  return (
    <span
      style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: '1.5rem',
        letterSpacing: '0.04em',
        color,
        opacity: 0.55,
      }}
    >
      #REF-{code}
    </span>
  );
}

function cardBase(cat: Category): React.CSSProperties {
  return {
    width: '100%',
    height: '100%',
    background: cat.bg,
    color: cat.ink,
    fontFamily: 'Inter, "Helvetica Neue", system-ui, sans-serif',
    position: 'relative',
  };
}

// ── Props compartidas de todas las variantes ─────────────────────────────

export interface CardProps {
  item: Card;
  cat: Category;
  /** @deprecated mantenido por compat; las barras/anillos ahora animan vía CSS. */
  progress: number;
  fontScale: number;
  /** Duración total de la fase actual en ms — pasada a animaciones CSS. */
  phaseDurationMs: number;
  /** Timestamp performance.now() del inicio de la fase actual (no se usa todavía pero ayuda a debug). */
  phaseStart?: number;
  paused?: boolean;
  quizState?: 'question' | 'answer' | null;
  /** @deprecated mantenido por compat. */
  quizProgress?: number;
  quizSeconds?: number;
}

// ── 1 · CLASSIC ─────────────────────────────────────────────────────────
function CardClassic({ item, cat, fontScale, phaseDurationMs, paused }: CardProps) {
  return (
    <div
      style={{
        ...cardBase(cat),
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        padding: '64px 96px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CategoryBadge cat={cat} />
        <span style={{ color: cat.ink, opacity: 0.5, fontSize: '1.4rem', fontWeight: 500 }}>
          {item.title}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4%',
        }}
      >
        <HighlightedText
          text={item.content}
          accent={cat.accent}
          style={{
            fontSize: `${5.5 * fontScale}rem`,
            lineHeight: 1.12,
            color: cat.ink,
            fontWeight: 500,
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 32 }}>
        <RefCode code={item.refCode} color={cat.ink} />
        <ProgressBar durationMs={phaseDurationMs} paused={paused} accent={cat.accent} />
      </div>
    </div>
  );
}

// ── 2 · EDITORIAL SPLIT ──────────────────────────────────────────────────
function CardEditorial({ item, cat, fontScale, phaseDurationMs, paused }: CardProps) {
  return (
    <div style={{ ...cardBase(cat), display: 'grid', gridTemplateColumns: '320px 1fr' }}>
      <div
        style={{
          background: `linear-gradient(180deg, ${cat.accent} 0%, ${cat.ink} 100%)`,
          color: '#fff',
          padding: '64px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Icon name={cat.glyph} size={48} strokeWidth={1.6} />
        <div>
          <div style={{ fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0.75 }}>
            {cat.label}
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 600, marginTop: 12, lineHeight: 1.1 }}>
            {item.title}
          </div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem', opacity: 0.7 }}>
          #REF-{item.refCode}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: '1fr auto', padding: '72px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HighlightedText
            text={item.content}
            accent={cat.accent}
            style={{
              fontSize: `${5 * fontScale}rem`,
              lineHeight: 1.15,
              color: cat.ink,
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          />
        </div>
        <ProgressBar durationMs={phaseDurationMs} paused={paused} accent={cat.accent} />
      </div>
    </div>
  );
}

// ── 3 · MAGAZINE QUOTE ───────────────────────────────────────────────────
function CardMagazine({ item, cat, fontScale, phaseDurationMs, paused }: CardProps) {
  return (
    <div
      style={{
        ...cardBase(cat),
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        padding: '64px 120px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -60,
          left: 40,
          fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
          fontSize: '36rem',
          color: cat.accent,
          opacity: 0.07,
          lineHeight: 1,
          fontWeight: 700,
          fontStyle: 'italic',
        }}
      >
        &ldquo;
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <CategoryBadge cat={cat} />
        <span style={{ color: cat.ink, opacity: 0.5, fontSize: '1.4rem', fontWeight: 500 }}>
          {item.title}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 2%',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: `${6 * fontScale}rem`,
            lineHeight: 1.08,
            color: cat.ink,
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          <HighlightedText text={item.content} accent={cat.accent} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, position: 'relative' }}>
        <span style={{ fontSize: '1.6rem', color: cat.ink, opacity: 0.75, fontWeight: 500 }}>
          — {item.title}
        </span>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <ProgressBar durationMs={phaseDurationMs} paused={paused} accent={cat.accent} />
        </div>
        <RefCode code={item.refCode} color={cat.ink} />
      </div>
    </div>
  );
}

// ── 4 · QUIZ SPOTLIGHT ───────────────────────────────────────────────────
interface CountdownRingProps {
  durationMs: number;
  accent: string;
  label: React.ReactNode;
  paused?: boolean;
}

function CountdownRing({ durationMs, accent, label, paused }: CountdownRingProps) {
  const R = 140;
  const C = 2 * Math.PI * R;
  // CSS var consume el circumference como punto de partida del dashoffset.
  return (
    <div
      style={{
        position: 'relative',
        width: 340,
        height: 340,
        ['--edu-circumference' as string]: String(C),
      } as React.CSSProperties}
    >
      <svg width="340" height="340" viewBox="0 0 340 340">
        <circle cx="170" cy="170" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="14" />
        <circle
          cx="170"
          cy="170"
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          transform="rotate(-90 170 170)"
          style={{
            strokeDashoffset: C,
            animationName: 'edu-countdown-fill',
          animationDuration: `${durationMs}ms`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '6rem',
          fontWeight: 600,
          color: accent,
          letterSpacing: '-0.02em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Visual({ imageId }: { imageId?: string | null }) {
  const visual = visuals.find((v) => v.id === imageId);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [imageId]);
  if (!visual) return null;
  return <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
    {failed ? <div role="status" style={{ padding: 40, fontSize: 32 }}>Imagen no disponible: {visual.alt}</div> :
      /* Local curated files retain their source metadata and are served without external requests. */
      <img src={visual.src} alt={visual.alt} onError={() => setFailed(true)} style={{ width: '100%', height: 520, objectFit: 'contain', borderRadius: 20 }} />}
    <figcaption style={{ fontSize: 22, lineHeight: 1.4 }}>
      <div>{visual.caption}</div>
      <div style={{ fontSize: 18, marginTop: 8, overflowWrap: 'anywhere' }}>
        {visual.author}{visual.credit && visual.credit !== visual.author && !/^own work$/i.test(visual.credit) ? ` · ${visual.credit}` : ''} · <a href={visual.source} target="_blank" rel="noreferrer">Fuente</a> · <a href={visual.licenseUrl || visual.source} target="_blank" rel="noreferrer">{visual.license}</a> · {visual.changes}
      </div>
    </figcaption>
  </figure>;
}

function CardVisual({ item, cat, fontScale, phaseDurationMs, paused }: CardProps) {
  return <div style={{ ...cardBase(cat), padding: '64px 80px', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 32 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><CategoryBadge cat={cat} /><span style={{ fontSize: 28 }}>{item.title}</span></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 64, minHeight: 0 }}>
      <Visual imageId={item.imageId} />
      <HighlightedText text={item.content} accent={cat.accent} style={{ fontSize: `${3.5 * fontScale}rem`, lineHeight: 1.2, color: cat.ink, fontWeight: 600 }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}><RefCode code={item.refCode} color={cat.ink} /><ProgressBar durationMs={phaseDurationMs} paused={paused} accent={cat.accent} /></div>
  </div>;
}

function CardQuiz({ item, cat, fontScale, phaseDurationMs, paused, quizState, quizSeconds = 0 }: CardProps) {
  const isAnswer = quizState === 'answer';
  const quiz = item.quiz;
  const structured = quiz && quiz.options.length >= 2 && quiz.options.length <= 4 && quiz.options.every((o) => o.trim()) && Number.isInteger(quiz.correctIndex) && quiz.correctIndex >= 0 && quiz.correctIndex < quiz.options.length;
  const dense = item.content.length + item.answer.length + (quiz?.options.join('').length || 0) > 450;
  return <div style={{ ...cardBase(cat), display: 'grid', gridTemplateRows: 'auto 1fr auto', padding: '56px 80px', gap: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><CategoryBadge cat={cat} /><span style={{ fontSize: 28 }}>{item.title}</span></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 60 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ fontSize: 24, color: cat.accent, fontWeight: 700 }}>{isAnswer ? 'Respuesta y explicación' : 'Piensa tu respuesta'}</div>
        <HighlightedText text={structured || !isAnswer ? item.content : item.answer} accent={cat.accent} style={{ fontSize: `${(structured ? (dense ? 2.5 : 3.4) : 4.2) * fontScale}rem`, lineHeight: 1.15, color: cat.ink, fontWeight: 600 }} />
        {structured && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {quiz.options.map((option, i) => <div key={i} style={{ padding: '24px 28px', borderRadius: 18, fontSize: `${(dense ? 1.75 : 2.3) * fontScale}rem`, border: `3px solid ${isAnswer && i === quiz.correctIndex ? '#15803d' : cat.accentSoft}`, background: isAnswer && i === quiz.correctIndex ? '#dcfce7' : '#ffffff99', color: cat.ink }}>
            <strong>{String.fromCharCode(65 + i)}.</strong> {option}{isAnswer && i === quiz.correctIndex && <strong> · Correcta</strong>}
          </div>)}
        </div>}
        {structured && isAnswer && <p style={{ fontSize: `${(dense ? 1.6 : 2.2) * fontScale}rem`, lineHeight: 1.3, margin: 0, color: cat.ink }}>{item.answer}</p>}
      </div>
      <CountdownRing durationMs={phaseDurationMs} paused={paused} accent={cat.accent} label={isAnswer ? '✓' : Math.max(0, Math.ceil(quizSeconds))} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}><RefCode code={item.refCode} color={cat.ink} /><ProgressBar durationMs={phaseDurationMs} paused={paused} accent={cat.accent} /></div>
  </div>;
}

// ── 5 · MOSAIC ───────────────────────────────────────────────────────────
function CardMosaic({ item, cat, fontScale, phaseDurationMs, paused }: CardProps) {
  return (
    <div
      style={{
        ...cardBase(cat),
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gridTemplateRows: '1fr auto',
        gap: 24,
        padding: 32,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: '60px 72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        <CategoryBadge cat={cat} />
        <HighlightedText
          text={item.content}
          accent={cat.accent}
          style={{
            fontSize: `${4.6 * fontScale}rem`,
            lineHeight: 1.15,
            color: cat.ink,
            fontWeight: 500,
            letterSpacing: '-0.01em',
          }}
        />
        <RefCode code={item.refCode} color={cat.ink} />
      </div>
      <div
        style={{
          background: cat.accent,
          color: '#fff',
          borderRadius: 28,
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gridRow: 'span 1',
        }}
      >
        <Icon name={cat.glyph} size={64} strokeWidth={1.4} />
        <div>
          <div style={{ fontSize: '1.4rem', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>
            {cat.label}
          </div>
          <div
            style={{
              fontSize: '4rem',
              fontWeight: 700,
              marginTop: 12,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {item.title}
          </div>
        </div>
      </div>
      <div
        style={{
          gridColumn: '1 / -1',
          background: '#fff',
          borderRadius: 28,
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Icon name="clock" size={20} style={{ color: cat.ink, opacity: 0.5 }} />
        <div style={{ flex: 1 }}>
          <ProgressBar durationMs={phaseDurationMs} paused={paused} accent={cat.accent} />
        </div>
        <span style={{ fontSize: '1.3rem', color: cat.ink, opacity: 0.5, fontFamily: 'JetBrains Mono, monospace' }}>
          rotando
        </span>
      </div>
    </div>
  );
}

// ── 6 · AURORA ───────────────────────────────────────────────────────────
function CardAurora({ item, cat, fontScale, phaseDurationMs, paused }: CardProps) {
  return (
    <div
      style={{
        ...cardBase(cat),
        position: 'relative',
        overflow: 'hidden',
        padding: '64px 96px',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          top: -300,
          left: -200,
          background: cat.accentSoft,
          filter: 'blur(80px)',
          opacity: 0.7,
          animation: 'edu-breathe-a 7s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          bottom: -300,
          right: -150,
          background: cat.accent,
          filter: 'blur(120px)',
          opacity: 0.18,
          animation: 'edu-breathe-b 9s ease-in-out infinite',
        }}
      />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CategoryBadge cat={cat} large />
        <span style={{ color: cat.ink, opacity: 0.5, fontSize: '1.5rem', fontWeight: 500 }}>
          {item.title}
        </span>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4%' }}>
        <HighlightedText
          text={item.content}
          accent={cat.accent}
          style={{
            fontSize: `${6.4 * fontScale}rem`,
            lineHeight: 1.08,
            color: cat.ink,
            fontWeight: 600,
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        />
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 32 }}>
        <RefCode code={item.refCode} color={cat.ink} />
        <ProgressBar durationMs={phaseDurationMs} paused={paused} accent={cat.accent} />
      </div>
    </div>
  );
}

// ── Registro y exports ───────────────────────────────────────────────────

export interface CardVariant {
  id: string;
  label: string;
  Component: React.ComponentType<CardProps>;
}

export const CARD_VARIANTS: CardVariant[] = [
  { id: 'classic', label: 'Clásica', Component: CardClassic },
  { id: 'editorial', label: 'Editorial', Component: CardEditorial },
  { id: 'magazine', label: 'Magazine', Component: CardMagazine },
  { id: 'quiz', label: 'Quiz Spotlight', Component: CardQuiz },
  { id: 'mosaic', label: 'Mosaico', Component: CardMosaic },
  { id: 'aurora', label: 'Aurora', Component: CardAurora },
];

export type CardVariantId = 'classic' | 'editorial' | 'magazine' | 'quiz' | 'mosaic' | 'aurora';

export function defaultVariantFor(type: string): CardVariantId {
  switch (type) {
    case 'QUOTE': return 'magazine';
    case 'QUIZ': return 'quiz';
    case 'HISTORY': return 'editorial';
    case 'HUMOR': return 'mosaic';
    case 'FACT': return 'aurora';
    default: return 'classic';
  }
}

interface CardRendererProps extends CardProps {
  variant?: string;
}

function FittedCard({ children, background }: { children: React.ReactNode; background: string }) {
  const host = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState<number | null>(null);
  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / 1920, entry.contentRect.height / 1080)));
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background }}>
    <div style={{ position: 'absolute', width: 1920, height: 1080, left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${scale ?? 1})`, visibility: scale === null ? 'hidden' : 'visible' }}>{children}</div>
  </div>;
}

export default function CardRenderer({ variant, ...props }: CardRendererProps) {
  if (props.item.type === 'QUIZ') return <FittedCard background={props.cat.bg}><CardQuiz {...props} /></FittedCard>;
  if (visuals.some((v) => v.id === props.item.imageId)) return <FittedCard background={props.cat.bg}><CardVisual {...props} /></FittedCard>;
  const def = CARD_VARIANTS.find((v) => v.id === variant) || CARD_VARIANTS[0];
  const C = def.Component;
  return <C {...props} />;
}
