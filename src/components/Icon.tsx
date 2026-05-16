// ── EduDisplay · Iconografía mínima ─────────────────────────────────────
// SVGs simples 24×24, stroke-only, currentColor.
import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export default function Icon({ name, size = 24, strokeWidth = 1.8, style }: IconProps) {
  const s: React.CSSProperties = { width: size, height: size, ...(style || {}) };
  const common = {
    viewBox: '0 0 24 24' as const,
    fill: 'none' as const,
    stroke: 'currentColor' as const,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: s,
  };
  switch (name) {
    case 'atom':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-60 12 12)" />
        </svg>
      );
    case 'scroll':
      return (
        <svg {...common}>
          <path d="M6 4h10a3 3 0 0 1 3 3v10a3 3 0 0 0 3 3H10a3 3 0 0 1-3-3V7a3 3 0 0 0-3-3h2Z" />
          <path d="M10 9h6M10 13h6" />
        </svg>
      );
    case 'quote':
      return (
        <svg {...common}>
          <path d="M7 8c-2 1-3 3-3 6v3h5v-5H5" />
          <path d="M17 8c-2 1-3 3-3 6v3h5v-5h-4" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
        </svg>
      );
    case 'smile':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14c1 1.5 2.5 2 4 2s3-.5 4-2" />
          <circle cx="9" cy="10" r=".6" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r=".6" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common}><path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none" /></svg>
      );
    case 'pause':
      return (
        <svg {...common}>
          <rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none" />
          <rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'next':
      return <svg {...common}><path d="M9 6l6 6-6 6" /></svg>;
    case 'prev':
      return <svg {...common}><path d="M15 6l-6 6 6 6" /></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.3-4.3" /></svg>;
    case 'edit':
      return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16v4Z" /><path d="m14 6 4 4" /></svg>;
    case 'trash':
      return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'eye-off':
      return (
        <svg {...common}>
          <path d="M3 3l18 18M10.5 6.2A9.4 9.4 0 0 1 12 6c6.5 0 10 6 10 6a14 14 0 0 1-3.2 4M6.6 6.6A14 14 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8" />
        </svg>
      );
    case 'tv':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 18v3" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case 'check':
      return <svg {...common}><path d="m5 12 4 4 10-10" /></svg>;
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <path d="M8 8l1.5 2.5L12 12l-2.5 1.5L8 16l-1.5-2.5L4 12l2.5-1.5z" />
        </svg>
      );
    case 'logo':
      return (
        <svg viewBox="0 0 32 32" fill="none" style={s}>
          <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M12 30h8M16 26v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
