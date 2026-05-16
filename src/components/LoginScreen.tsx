'use client';
// ── EduDisplay · Login (Google Sign-In con whitelist) ─────────────────────
import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Icon from './Icon';

interface LoginScreenProps {
  // Recibe el email del usuario autenticado; el parent decide si lo acepta
  // (whitelist) o lo rechaza llamando `reject()` para forzar signOut.
  onLogin?: (user: { email: string; uid: string }) => Promise<void> | void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user.email) {
        await signOut(auth);
        setError('La cuenta de Google no expone email. Usa otra cuenta.');
        return;
      }
      await onLogin?.({ email: user.email, uid: user.uid });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Dominio no autorizado en Firebase Auth. Añádelo en la consola.');
      } else {
        const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#F8F9FA',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#0f172a',
      }}
    >
      {/* lado izquierdo · marca + preview decorativa */}
      <div
        style={{
          position: 'relative',
          padding: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 20% 20%, #ECFDF5 0%, transparent 60%), radial-gradient(circle at 80% 80%, #EFF6FF 0%, transparent 60%), #F8F9FA',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#0f172a',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="logo" size={26} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>EduDisplay</div>
            <div style={{ fontSize: 12, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Panel de administración
            </div>
          </div>
        </div>

        {/* Tarjeta ejemplo decorativa */}
        <div
          style={{
            position: 'relative',
            margin: '24px auto',
            width: '88%',
            aspectRatio: '16 / 9',
            background: '#ECFDF5',
            borderRadius: 24,
            boxShadow: '0 30px 80px -30px rgba(15,23,42,0.25), 0 1px 0 rgba(15,23,42,0.04)',
            border: '1px solid rgba(15,23,42,0.05)',
            padding: '32px 40px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            color: '#064E3B',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid #A7F3D0',
                color: '#059669',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              <Icon name="atom" size={14} strokeWidth={2.2} />
              Ciencia
            </span>
            <span style={{ fontSize: 11, color: '#064E3B', opacity: 0.55 }}>Cuerpo humano</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: 26, lineHeight: 1.18, fontWeight: 500, letterSpacing: '-0.01em' }}>
              Tu <span style={{ color: '#059669', fontWeight: 700 }}>ADN</span> estirado mediría dos veces la
              distancia de la Tierra al Sol.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: 0.55 }}>#REF-A20</span>
            <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 99 }}>
              <div style={{ width: '62%', height: '100%', background: '#059669', borderRadius: 99, opacity: 0.7 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, color: '#475569', fontSize: 12 }}>
          <span>v0.4.1 · 2026</span>
          <span>•</span>
          <span>Firebase Firestore · onSnapshot</span>
        </div>
      </div>

      {/* lado derecho · sign-in con Google */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 56 }}>
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Bienvenida de vuelta
            </h1>
            <p style={{ margin: '8px 0 0', color: '#64748B', fontSize: 15 }}>
              Inicia sesión con tu cuenta de Google autorizada para administrar la pantalla.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              background: loading ? '#F1F5F9' : '#fff',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <GoogleGlyph />
            {loading ? 'Conectando…' : 'Continuar con Google'}
          </button>

          <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
            Solo los emails declarados en la whitelist del proyecto pueden acceder.
            Si tu cuenta no está autorizada, contacta al admin.
          </p>
        </div>
      </div>
    </div>
  );
}

// Glifo Google oficial (4 colores) en SVG simple.
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
