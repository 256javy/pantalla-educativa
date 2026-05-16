'use client';
// ── useWakeLock ──────────────────────────────────────────────────────────
// Solicita un screen wake lock para que el dispositivo no apague la pantalla
// mientras la app está visible. Estándar W3C Screen Wake Lock API.
// Requiere HTTPS y un browser basado en Chromium reciente (Silk OK).
//
// El lock se libera automáticamente si el documento se oculta (otra pestaña,
// minimizar). Lo re-solicitamos cuando vuelve a ser visible.
import { useEffect, useState } from 'react';

interface WakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (event: 'release', cb: () => void) => void;
}

interface WakeLockNavigator {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
}

export type WakeLockStatus =
  | 'unsupported'
  | 'idle'
  | 'active'
  | 'released'
  | 'error';

export function useWakeLock(enabled = true): {
  status: WakeLockStatus;
  error: string | null;
} {
  const [status, setStatus] = useState<WakeLockStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const nav = navigator as unknown as WakeLockNavigator;
    if (!nav.wakeLock) {
      setStatus('unsupported');
      return;
    }

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const s = await nav.wakeLock!.request('screen');
        if (cancelled) {
          void s.release();
          return;
        }
        sentinel = s;
        setStatus('active');
        setError(null);
        s.addEventListener('release', () => {
          if (!cancelled) setStatus('released');
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'wake lock denied';
        setStatus('error');
        setError(msg);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (sentinel && !sentinel.released) {
        void sentinel.release();
      }
    };
  }, [enabled]);

  return { status, error };
}
