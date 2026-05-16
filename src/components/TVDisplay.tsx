'use client';
// ── Pantalla Educativa · motor de pantalla (TV) ─────────────────────────
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import type { Card } from '@/lib/types';
import Icon from './Icon';
import CardRenderer, { defaultVariantFor } from './CardRenderer';

// ── Tweaks shape ─────────────────────────────────────────────────────────
export interface TVTweaks {
  rotationSeconds: number;
  fontScale: number;
  demoMode: 'auto' | 'manual';
  palette: 'cream' | 'dark' | 'sepia';
}

// ── useDisplayEngine ─────────────────────────────────────────────────────
interface DisplayEngineOptions {
  items: Card[];
  rotationSeconds: number;
  paused: boolean;
  manual: boolean;
  onAdvance?: (() => void) | null;
}

interface DisplayEngineResult {
  index: number;
  current: Card;
  phase: 'idle' | 'question' | 'answer';
  progress: number;
  phaseDur: number;
  phaseStart: number;
  next: () => void;
  prev: () => void;
}

export function useDisplayEngine({
  items,
  rotationSeconds,
  paused,
  manual,
  onAdvance,
}: DisplayEngineOptions): DisplayEngineResult {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'question' | 'answer'>('idle');
  const [tick, setTick] = useState(0);
  const [phaseStart, setPhaseStart] = useState(() => performance.now());

  const current = items[index % items.length];
  const isQuiz = current?.type === 'QUIZ';

  const QUIZ_Q = 15 * 1000;
  const QUIZ_A = 6 * 1000;
  const NORMAL = rotationSeconds * 1000;
  const phaseDur = isQuiz ? (phase === 'answer' ? QUIZ_A : QUIZ_Q) : NORMAL;

  useEffect(() => { setIndex(0); }, [items]);

  useEffect(() => {
    setPhase(isQuiz ? 'question' : 'idle');
    setPhaseStart(performance.now());
    setTick(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items]);

  // Keep a ref to onAdvance so the RAF loop closure doesn't stale
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    if (paused || manual) return;
    let raf: number;
    const loop = () => {
      const now = performance.now();
      const t = now - phaseStart;
      setTick(t);
      if (t >= phaseDur) {
        if (isQuiz && phase === 'question') {
          setPhase('answer');
          setPhaseStart(now);
          setTick(0);
        } else {
          setIndex((i) => (i + 1) % items.length);
          onAdvanceRef.current?.();
        }
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, manual, phaseStart, phaseDur, isQuiz, phase, items.length]);

  const progress = Math.min(1, tick / phaseDur);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
    onAdvanceRef.current?.();
  }, [items.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length]);

  return { index, current, phase, progress, phaseDur, phaseStart, next, prev };
}

// ── useQuizSession ────────────────────────────────────────────────────────
interface QuizSession {
  startedAt: number;
  endsAt: number;
  totalMs: number;
  minutes: number;
  questions: number;
}

interface QuizFinished extends QuizSession {
  completed: boolean;
  endedAt: number;
}

interface QuizSessionResult {
  session: QuizSession | null;
  finished: QuizFinished | null;
  remainingMs: number;
  progress: number;
  start: (minutes: number) => void;
  cancel: () => void;
  finishEarly: () => void;
  bumpQuestion: () => void;
  dismissFinished: () => void;
}

export function useQuizSession(): QuizSessionResult {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState<QuizFinished | null>(null);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (now >= session.endsAt) {
      setFinished({ ...session, completed: true, endedAt: now });
      setSession(null);
    }
  }, [now, session]);

  const start = (minutes: number) => {
    const startedAt = Date.now();
    setFinished(null);
    setSession({
      startedAt,
      endsAt: startedAt + minutes * 60 * 1000,
      totalMs: minutes * 60 * 1000,
      minutes,
      questions: 0,
    });
  };

  const cancel = () => {
    setFinished(null);
    setSession(null);
  };

  const finishEarly = () => {
    if (!session) return;
    setFinished({ ...session, completed: false, endedAt: Date.now() });
    setSession(null);
  };

  const bumpQuestion = useCallback(() => {
    setSession((s) => (s ? { ...s, questions: s.questions + 1 } : s));
  }, []);

  const remainingMs = session ? Math.max(0, session.endsAt - now) : 0;
  const progress = session ? 1 - remainingMs / session.totalMs : 0;

  return {
    session,
    finished,
    remainingMs,
    progress,
    start,
    cancel,
    finishEarly,
    bumpQuestion,
    dismissFinished: () => setFinished(null),
  };
}

// ── TVStage ────────────────────────────────────────────────────────────────
interface TVStageProps {
  children: React.ReactNode;
  slotKey: string | number;
  palette: string;
}

function TVStage({ children, slotKey, palette }: TVStageProps) {
  const filter =
    palette === 'sepia'
      ? 'sepia(0.15) saturate(0.95)'
      : palette === 'dark'
        ? 'invert(0.88) hue-rotate(180deg) saturate(0.95)'
        : 'none';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        filter,
        animation: 'edu-breathe-stage 9s ease-in-out infinite',
        transformOrigin: 'center',
      }}
    >
      <div
        key={slotKey}
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'edu-fade-in 2.4s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── NextUpChip ─────────────────────────────────────────────────────────────
interface NextUpChipProps {
  items: Card[];
  index: number;
}

export function NextUpChip({ items, index }: NextUpChipProps) {
  const next = items[(index + 1) % items.length];
  if (!next) return null;
  const cat = CATEGORIES[next.type];
  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 14px 6px 10px',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(10px)',
        borderRadius: 999,
        border: '1px solid rgba(0,0,0,0.05)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.95rem',
        color: '#475569',
        opacity: 0.55,
        pointerEvents: 'none',
      }}
    >
      <span style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.8 }}>Sigue</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: cat.accent, fontWeight: 600 }}>
        <Icon name={cat.glyph} size={13} strokeWidth={2.4} />
        {cat.label}
      </span>
      <span style={{ opacity: 0.7 }}>· {next.title}</span>
    </div>
  );
}

// ── QuizSessionBadge ───────────────────────────────────────────────────────
function fmtMS(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface QuizSessionBadgeProps {
  remainingMs: number;
  progress: number;
  questions: number;
  onFinish: () => void;
}

export function QuizSessionBadge({ remainingMs, progress, questions, onFinish }: QuizSessionBadgeProps) {
  const violet = CATEGORIES.QUIZ.accent;
  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        left: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(14px)',
        borderRadius: 16,
        border: `1px solid ${CATEGORIES.QUIZ.accentSoft}`,
        fontFamily: 'Inter, system-ui, sans-serif',
        minWidth: 220,
        boxShadow: '0 10px 30px -16px rgba(15,23,42,0.18)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: violet, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%', background: violet,
              animation: 'edu-keyword-pulse 1.4s ease-in-out infinite',
            }}
          />
          Quiz Time
        </div>
        <button
          onClick={onFinish}
          style={{
            border: 'none', background: 'transparent', color: '#64748B',
            cursor: 'pointer', padding: 4, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}
        >
          Finalizar
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 28,
            fontWeight: 600,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmtMS(remainingMs)}
        </span>
        <span style={{ fontSize: 12, color: '#64748B' }}>
          · {questions} {questions === 1 ? 'pregunta' : 'preguntas'}
        </span>
      </div>
      <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: violet,
            opacity: 0.7,
            transition: 'width 0.25s linear',
          }}
        />
      </div>
    </div>
  );
}

// ── DisplayControls ────────────────────────────────────────────────────────
interface DisplayControlsProps {
  paused: boolean;
  onTogglePause: () => void;
  onPrev: () => void;
  onNext: () => void;
  manual: boolean;
  inSession: boolean;
  onOpenLauncher: () => void;
}

export function DisplayControls({ paused, onTogglePause, onPrev, onNext, manual, inSession, onOpenLauncher }: DisplayControlsProps) {
  const btn: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: 999,
    border: '1px solid rgba(0,0,0,0.08)',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    color: '#0f172a',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.15s, background 0.15s',
  };
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}
    >
      {!inSession && (
        <button
          onClick={onOpenLauncher}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '0 22px',
            height: 56,
            borderRadius: 999,
            border: 'none',
            background: CATEGORIES.QUIZ.accent,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: `0 8px 24px -10px ${CATEGORIES.QUIZ.accent}99`,
          }}
        >
          <Icon name="sparkles" size={20} strokeWidth={2.2} />
          Quiz Time
        </button>
      )}
      <button style={btn} onClick={onPrev} aria-label="anterior">
        <Icon name="prev" size={22} />
      </button>
      <button style={btn} onClick={onTogglePause} aria-label="pausa">
        <Icon name={paused ? 'play' : 'pause'} size={22} />
      </button>
      <button style={btn} onClick={onNext} aria-label="siguiente">
        <Icon name="next" size={22} />
      </button>
      {manual && (
        <span
          style={{
            marginLeft: 12,
            padding: '8px 14px',
            background: 'rgba(15,23,42,0.85)',
            color: '#fff',
            borderRadius: 999,
            fontSize: '1rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          modo manual
        </span>
      )}
    </div>
  );
}

// ── QuizTimeLauncher ───────────────────────────────────────────────────────
interface QuizTimeLauncherProps {
  onStart: (minutes: number) => void;
  onClose: () => void;
}

export function QuizTimeLauncher({ onStart, onClose }: QuizTimeLauncherProps) {
  const [custom, setCustom] = useState(12);
  const violet = CATEGORIES.QUIZ.accent;
  const presets = [
    { m: 5,  label: '5 min', hint: 'rapidito' },
    { m: 10, label: '10 min', hint: 'partida corta' },
    { m: 15, label: '15 min', hint: 'estándar' },
    { m: 20, label: '20 min', hint: 'reto' },
    { m: 30, label: '30 min', hint: 'maratón' },
  ];
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'grid', placeItems: 'center',
        animation: 'edu-fade-in 0.4s ease-out both',
        zIndex: 10,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 720,
          background: '#fff',
          borderRadius: 28,
          padding: '48px 56px',
          boxShadow: '0 60px 120px -40px rgba(15,23,42,0.5)',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <span
            style={{
              width: 44, height: 44, borderRadius: 12, background: CATEGORIES.QUIZ.bg,
              color: violet, display: 'grid', placeItems: 'center',
            }}
          >
            <Icon name="sparkles" size={24} strokeWidth={2.2} />
          </span>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: violet, fontWeight: 700 }}>
              Quiz Time
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
              ¿Cuánto rato vamos a jugar?
            </h2>
          </div>
        </div>
        <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.55, margin: '8px 0 28px' }}>
          Durante el tiempo elegido, la pantalla solo mostrará preguntas. Cada una se queda
          15 segundos antes de revelar la respuesta. Puedes terminar antes en cualquier momento.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
          {presets.map((p) => (
            <button
              key={p.m}
              onClick={() => onStart(p.m)}
              style={{
                padding: '20px 8px',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = violet;
                (e.currentTarget as HTMLButtonElement).style.background = CATEGORIES.QUIZ.bg;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
                (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.label}</span>
              <span style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '0.06em' }}>{p.hint}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, padding: 18, borderRadius: 14,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              Personalizado
            </div>
            <div style={{ fontSize: 14, color: '#475569', marginTop: 2 }}>Elige un valor entre 1 y 90 minutos</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number"
              min="1"
              max="90"
              value={custom}
              onChange={(e) => setCustom(Math.max(1, Math.min(90, +e.target.value || 1)))}
              style={{
                width: 80, padding: '10px 12px', borderRadius: 9,
                border: '1px solid #E2E8F0', fontSize: 16, fontWeight: 600,
                textAlign: 'center', fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
              }}
            />
            <span style={{ color: '#64748B' }}>min</span>
            <button
              onClick={() => onStart(custom)}
              style={{
                padding: '10px 18px', borderRadius: 9, border: 'none',
                background: violet, color: '#fff', fontWeight: 600, fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Empezar
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px', borderRadius: 9, border: 'none',
              background: 'transparent', color: '#64748B',
              fontWeight: 500, fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QuizTimeRecap ──────────────────────────────────────────────────────────
interface QuizTimeRecapProps {
  session: QuizFinished;
  onClose: () => void;
  onAgain: (minutes: number) => void;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: '20px 16px',
        borderRadius: 14,
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
      }}
    >
      <div
        style={{
          fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em',
          color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export function QuizTimeRecap({ session, onClose, onAgain }: QuizTimeRecapProps) {
  const violet = CATEGORIES.QUIZ.accent;
  const minutesPlayed = Math.round((session.endedAt - session.startedAt) / 60000);
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'grid', placeItems: 'center',
        animation: 'edu-fade-in 0.6s ease-out both',
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 620,
          background: '#fff',
          borderRadius: 28,
          padding: '56px 56px 40px',
          boxShadow: '0 60px 120px -40px rgba(15,23,42,0.55)',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 84, height: 84, borderRadius: '50%',
            margin: '0 auto 20px',
            background: CATEGORIES.QUIZ.bg,
            color: violet,
            display: 'grid', placeItems: 'center',
            animation: 'edu-breathe-stage 3s ease-in-out infinite',
          }}
        >
          <Icon name="sparkles" size={42} strokeWidth={2} />
        </div>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: violet, fontWeight: 700 }}>
          {session.completed ? '¡Tiempo cumplido!' : 'Sesión finalizada'}
        </div>
        <h2 style={{ margin: '8px 0 28px', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }}>
          Buen trabajo, equipo.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '4px 0 28px' }}>
          <Stat label="Preguntas vistas" value={session.questions} />
          <Stat label="Minutos jugados" value={minutesPlayed} />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 22px', borderRadius: 10, border: '1px solid #E2E8F0',
              background: '#fff', color: '#475569', fontWeight: 600, fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Volver a la pantalla
          </button>
          <button
            onClick={() => onAgain(session.minutes)}
            style={{
              padding: '12px 22px', borderRadius: 10, border: 'none',
              background: violet, color: '#fff', fontWeight: 600, fontSize: 15,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <Icon name="sparkles" size={16} strokeWidth={2.4} />
            Otra ronda de {session.minutes} min
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TVDisplay · componente principal ──────────────────────────────────────
interface TVDisplayProps {
  items: Card[];
  tweaks: TVTweaks;
  variantOverride?: string;
  showControls?: boolean;
  showNextUp?: boolean;
  autostart?: boolean;
  /** Se llama cuando el engine vuelve al primer item (wrap-around). */
  onLoopComplete?: () => void;
}

export default function TVDisplay({
  items,
  tweaks,
  variantOverride,
  showControls = true,
  showNextUp = true,
  autostart = true,
  onLoopComplete,
}: TVDisplayProps) {
  const [paused, setPaused] = useState(!autostart);
  const manual = tweaks.demoMode === 'manual';

  const quiz = useQuizSession();

  const allQuizes = useMemo(
    () => items.filter((it) => it.type === 'QUIZ' && it.active !== false),
    [items]
  );
  const activeItems = quiz.session ? (allQuizes.length ? allQuizes : items) : items;

  const handleAdvance = useCallback(() => {
    if (quiz.session) quiz.bumpQuestion();
  }, [quiz]);

  const eng = useDisplayEngine({
    items: activeItems,
    rotationSeconds: tweaks.rotationSeconds,
    paused,
    manual,
    onAdvance: handleAdvance,
  });

  // Detección de wrap-around: cuando el index cae de N-1 a 0 (no en el
  // primer mount con index=0).
  const prevIndexRef = useRef(eng.index);
  useEffect(() => {
    const prev = prevIndexRef.current;
    if (prev > eng.index) {
      onLoopComplete?.();
    }
    prevIndexRef.current = eng.index;
  }, [eng.index, onLoopComplete]);

  const cat = CATEGORIES[eng.current.type];
  const variant = variantOverride || defaultVariantFor(eng.current.type);

  const [hover, setHover] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const quizSeconds = 15 - eng.progress * 15;

  const inSession = !!quiz.session;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#F8F9FA',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <TVStage slotKey={eng.index} palette={tweaks.palette}>
        <CardRenderer
          variant={variant}
          item={eng.current}
          cat={cat}
          progress={eng.progress}
          phaseDurationMs={eng.phaseDur}
          phaseStart={eng.phaseStart}
          paused={paused || manual}
          quizState={eng.current.type === 'QUIZ' && eng.phase !== 'idle' ? eng.phase : null}
          quizProgress={eng.progress}
          quizSeconds={quizSeconds}
          fontScale={tweaks.fontScale}
        />
      </TVStage>

      {showNextUp && !inSession && (
        <NextUpChip items={activeItems} index={eng.index} />
      )}

      {inSession && quiz.session && (
        <QuizSessionBadge
          remainingMs={quiz.remainingMs}
          progress={quiz.progress}
          questions={quiz.session.questions}
          onFinish={quiz.finishEarly}
        />
      )}

      {showControls && (hover || manual || inSession) && (
        <DisplayControls
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          onPrev={eng.prev}
          onNext={eng.next}
          manual={manual}
          inSession={inSession}
          onOpenLauncher={() => setLauncherOpen(true)}
        />
      )}

      {launcherOpen && !inSession && (
        <QuizTimeLauncher
          onStart={(m) => { quiz.start(m); setLauncherOpen(false); }}
          onClose={() => setLauncherOpen(false)}
        />
      )}

      {quiz.finished && (
        <QuizTimeRecap
          session={quiz.finished}
          onClose={quiz.dismissFinished}
          onAgain={(m) => { quiz.start(m); }}
        />
      )}
    </div>
  );
}
