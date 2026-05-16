'use client';
// ── EduDisplay · Login ────────────────────────────────────────────────────
import React, { useState } from 'react';
import Icon from './Icon';

interface LoginScreenProps {
  onLogin?: (user: { email: string }) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 14px 14px 42px',
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  background: '#fff',
  fontSize: 15,
  color: '#0f172a',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

interface FieldProps {
  label: string;
  icon: string;
  children: React.ReactNode;
}

function Field({ label, icon, children }: FieldProps) {
  return (
    <label style={{ display: 'block', position: 'relative' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 8 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
          }}
        >
          <Icon name={icon} size={18} />
        </span>
        {children}
      </div>
    </label>
  );
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('familia@edudisplay.app');
  const [password, setPassword] = useState('•••••••••');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email && password) {
        setLoading(false);
        onLogin?.({ email });
      } else {
        setLoading(false);
        setError('Credenciales inválidas');
      }
    }, 700);
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

      {/* lado derecho · formulario */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 56 }}>
        <form
          onSubmit={submit}
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Bienvenida de vuelta
            </h1>
            <p style={{ margin: '8px 0 0', color: '#64748B', fontSize: 15 }}>
              Inicia sesión para administrar la pantalla del salón.
            </p>
          </div>

          <Field label="Correo" icon="mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={inputStyle}
              autoComplete="email"
            />
          </Field>

          <Field label="Contraseña" icon="lock">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: 6,
              }}
              aria-label={showPwd ? 'ocultar' : 'mostrar'}
            >
              <Icon name={showPwd ? 'eye-off' : 'eye'} size={18} />
            </button>
          </Field>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
              <input type="checkbox" defaultChecked /> Recordar este equipo
            </label>
            <a href="#" style={{ color: '#2563EB', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && (
            <div style={{ color: '#E11D48', fontSize: 13, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              border: 'none',
              background: loading ? '#94A3B8' : '#0f172a',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: '0.01em',
              cursor: loading ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Entrando…' : <><span>Entrar al panel</span> <Icon name="next" size={16} strokeWidth={2.4} /></>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94A3B8', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span>o</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          <button
            type="button"
            onClick={() => onLogin?.({ email: 'demo@edudisplay.app' })}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              background: '#fff',
              color: '#0f172a',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Continuar como invitada (demo)
          </button>
        </form>
      </div>
    </div>
  );
}
