'use client';
// ── ZoomControl ──────────────────────────────────────────────────────────
// Control flotante para ajustar un factor de zoom aplicable al /display.
// Útil en navegadores que no permiten zoom nativo (Amazon Silk en Fire TV).
//
// El zoom afecta el "viewport interno" del contenido: zoom < 1 hace que la
// card crea tener más espacio (cabe más, todo se ve más pequeño); zoom > 1
// hace que crea tener menos espacio (texto más grande, puede recortarse).
import { useCallback, useEffect, useState } from 'react';
import Icon from './Icon';

const LS_KEY = 'pantalla-educativa-zoom';
const MIN = 0.5;
const MAX = 1.5;
const STEP = 0.05;

function clamp(z: number) {
  return Math.max(MIN, Math.min(MAX, Math.round(z * 100) / 100));
}

export function useZoom(defaultZoom = 1): [number, (z: number) => void] {
  const [zoom, setZoomState] = useState(defaultZoom);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = parseFloat(raw);
        if (Number.isFinite(parsed)) setZoomState(clamp(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const setZoom = useCallback((z: number) => {
    const next = clamp(z);
    setZoomState(next);
    try {
      localStorage.setItem(LS_KEY, String(next));
    } catch {
      // ignore
    }
  }, []);

  return [zoom, setZoom];
}

interface ZoomControlProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

export default function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  const [visible, setVisible] = useState(false);

  // Toggle visibilidad con doble-tap o tecla 'z' — discreto en pantalla.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') setVisible((v) => !v);
    };
    let lastTap = 0;
    const onTouch = () => {
      const now = Date.now();
      if (now - lastTap < 400) setVisible((v) => !v);
      lastTap = now;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchend', onTouch);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchend', onTouch);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        borderRadius: 999,
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 12,
        opacity: visible ? 0.95 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.25s',
        zIndex: 100,
      }}
      onMouseEnter={() => setVisible(true)}
    >
      <button
        onClick={() => onChange(zoom - STEP)}
        disabled={zoom <= MIN}
        style={zoomBtnStyle(zoom <= MIN)}
        aria-label="reducir zoom"
      >
        <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>−</span>
      </button>
      <button
        onClick={() => onChange(1)}
        style={{ ...zoomBtnStyle(false), minWidth: 56, fontSize: 11, fontWeight: 600 }}
        aria-label="restablecer zoom"
        title="Restablecer (100%)"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={() => onChange(zoom + STEP)}
        disabled={zoom >= MAX}
        style={zoomBtnStyle(zoom >= MAX)}
        aria-label="aumentar zoom"
      >
        <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>+</span>
      </button>
      <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
      <button
        onClick={() => setVisible(false)}
        style={zoomBtnStyle(false)}
        aria-label="ocultar"
        title="Ocultar (presiona Z o doble-tap para mostrar)"
      >
        <Icon name="eye-off" size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function zoomBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    minWidth: 28,
    borderRadius: 999,
    border: 'none',
    background: disabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
    color: disabled ? 'rgba(255,255,255,0.35)' : '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
  };
}
