'use client';
// ── /admin/import — Importar tarjetas desde JSON generado por IA ─────────
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCards } from '@/lib/use-cards';
import { createCard } from '@/lib/cards-repo';
import { CATEGORIES } from '@/lib/categories';
import Icon from '@/components/Icon';
import {
  CARD_JSON_SCHEMA,
  parseImportPayload,
  type ParsedItem,
} from '@/lib/card-schema';

type ImportStatus = 'idle' | 'importing' | 'done';

interface ImportResult {
  index: number;
  refCode: string;
  ok: boolean;
  error?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('edudisplay-user');
      if (stored) setUser(JSON.parse(stored));
      else router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  }, [router]);

  const { cards: existing } = useCards();
  const existingRefCodes = useMemo(
    () => new Set(existing.map((c) => c.refCode)),
    [existing]
  );

  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [results, setResults] = useState<ImportResult[]>([]);
  const [copied, setCopied] = useState(false);

  const handleValidate = () => {
    setResults([]);
    setStatus('idle');
    if (text.trim() === '') {
      setItems([]);
      setParseError('Pega JSON o sube un archivo');
      return;
    }
    const { parseError: err, items: parsed } = parseImportPayload(text);
    setParseError(err ?? null);
    setItems(parsed);
  };

  const handleFile = async (file: File) => {
    const t = await file.text();
    setText(t);
    setResults([]);
    setStatus('idle');
    const { parseError: err, items: parsed } = parseImportPayload(t);
    setParseError(err ?? null);
    setItems(parsed);
  };

  const handleImport = async () => {
    setStatus('importing');
    setResults([]);
    const toImport = items.filter(
      (it) =>
        it.result.ok &&
        (!skipDuplicates || !existingRefCodes.has(it.result.card.refCode))
    );

    const out: ImportResult[] = [];
    for (const it of toImport) {
      if (!it.result.ok) continue;
      try {
        await createCard(it.result.card);
        out.push({ index: it.index, refCode: it.result.card.refCode, ok: true });
      } catch (err) {
        out.push({
          index: it.index,
          refCode: it.result.card.refCode,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    setResults(out);
    setStatus('done');
  };

  const copySchema = async () => {
    const txt = JSON.stringify(CARD_JSON_SCHEMA, null, 2);
    await navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!user) {
    return (
      <div style={loadingStyle}>
        Cargando…
      </div>
    );
  }

  const valid = items.filter((it) => it.result.ok);
  const invalid = items.filter((it) => !it.result.ok);
  const duplicates = valid.filter(
    (it) => it.result.ok && existingRefCodes.has(it.result.card.refCode)
  );
  const toImportCount = skipDuplicates ? valid.length - duplicates.length : valid.length;

  return (
    <div style={pageStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={logoStyle}>
            <Icon name="logo" size={20} />
          </div>
          <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>EduDisplay</span>
          <span style={{ color: '#94A3B8', fontSize: 13, marginLeft: 8 }}>· importar</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => router.push('/admin')} style={ghostBtnStyle}>
            <Icon name="prev" size={14} /> Volver al admin
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={bodyStyle}>
        {/* Schema column */}
        <section style={schemaColStyle}>
          <header style={{ marginBottom: 14 }}>
            <h2 style={h2Style}>Esquema JSON</h2>
            <p style={subStyle}>
              Pega este esquema al prompt del modelo de IA para que genere tarjetas válidas.
              El input es un <strong>array</strong> de objetos sin <code>id</code>.
            </p>
            <button onClick={copySchema} style={primaryBtnStyle}>
              <Icon name={copied ? 'check' : 'edit'} size={14} />
              {copied ? 'Copiado' : 'Copiar esquema'}
            </button>
          </header>
          <pre style={preStyle}>
            <code>{JSON.stringify(CARD_JSON_SCHEMA, null, 2)}</code>
          </pre>
        </section>

        {/* Input + Results column */}
        <section style={inputColStyle}>
          <h2 style={h2Style}>Cargar tarjetas</h2>
          <p style={subStyle}>
            Pega el JSON aquí o sube un archivo <code>.json</code>.
            Al validar verás un resumen por tarjeta.
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <label style={fileBtnStyle}>
              <Icon name="plus" size={14} />
              Subir .json
              <input
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <button onClick={() => { setText(''); setItems([]); setResults([]); setParseError(null); setStatus('idle'); }} style={ghostBtnStyle}>
              Limpiar
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='[{"type":"FACT","title":"...","content":"...","answer":"","refCode":"A20","active":true,"frequency":"MEDIUM"}]'
            style={textareaStyle}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <button onClick={handleValidate} style={primaryBtnStyle} disabled={status === 'importing'}>
              <Icon name="check" size={14} /> Validar
            </button>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
              />
              Saltar duplicados por <code>refCode</code>
            </label>
          </div>

          {parseError && (
            <div style={errorBoxStyle}>
              <strong>Error de parseo:</strong> {parseError}
            </div>
          )}

          {items.length > 0 && (
            <>
              <div style={summaryStyle}>
                <SummaryPill label="Total" value={items.length} color="#0f172a" />
                <SummaryPill label="Válidas" value={valid.length} color="#059669" />
                <SummaryPill label="Inválidas" value={invalid.length} color="#DC2626" />
                <SummaryPill label="Duplicadas" value={duplicates.length} color="#CA8A04" />
                <SummaryPill label="A importar" value={toImportCount} color="#2563EB" />
              </div>

              {/* Lista por tarjeta */}
              <div style={listStyle}>
                {items.map((it) => (
                  <ItemRow
                    key={it.index}
                    item={it}
                    duplicate={it.result.ok && existingRefCodes.has(it.result.card.refCode)}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, gap: 10 }}>
                <button
                  onClick={handleImport}
                  disabled={toImportCount === 0 || status === 'importing'}
                  style={{
                    ...primaryBtnStyle,
                    background: toImportCount === 0 ? '#94A3B8' : '#059669',
                    cursor: toImportCount === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Icon name="check" size={14} />
                  {status === 'importing' ? 'Importando…' : `Importar ${toImportCount}`}
                </button>
              </div>
            </>
          )}

          {results.length > 0 && (
            <div style={resultBoxStyle}>
              <strong style={{ color: '#0f172a' }}>Importación finalizada:</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                <li>✅ {results.filter((r) => r.ok).length} insertadas</li>
                {results.some((r) => !r.ok) && (
                  <li>❌ {results.filter((r) => !r.ok).length} fallaron</li>
                )}
              </ul>
              {results.some((r) => !r.ok) && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer', color: '#475569' }}>Ver fallos</summary>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: '#DC2626' }}>
                    {results.filter((r) => !r.ok).map((r) => (
                      <li key={r.index}>
                        #{r.index + 1} {r.refCode}: {r.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────

function SummaryPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
      padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff',
      minWidth: 90,
    }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
        {value}
      </span>
    </div>
  );
}

function ItemRow({ item, duplicate }: { item: ParsedItem; duplicate: boolean }) {
  const ok = item.result.ok;
  const refCode = item.refCode ?? '—';
  const title = item.title ?? '(sin título)';
  const type = ok && item.result.ok ? item.result.card.type : undefined;
  const cat = type ? CATEGORIES[type] : null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '36px 90px 1fr 140px',
      gap: 10,
      alignItems: 'center',
      padding: '10px 12px',
      borderBottom: '1px solid #F1F5F9',
      background: ok ? (duplicate ? '#FEFCE8' : '#fff') : '#FEF2F2',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        display: 'grid', placeItems: 'center',
        background: ok ? '#ECFDF5' : '#FEE2E2',
        color: ok ? '#059669' : '#DC2626',
      }}>
        <Icon name={ok ? 'check' : 'trash'} size={14} strokeWidth={2.4} />
      </div>
      <code style={{ fontSize: 13, color: cat?.accent ?? '#64748B', fontWeight: 600 }}>
        {refCode}
      </code>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          #{item.index + 1} {title}
        </div>
        {!ok && !item.result.ok && (
          <div style={{ fontSize: 12, color: '#DC2626', marginTop: 2 }}>
            {item.result.errors.join(' · ')}
          </div>
        )}
        {ok && duplicate && (
          <div style={{ fontSize: 12, color: '#CA8A04', marginTop: 2 }}>
            Duplicado: ya existe una card con este refCode
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', fontSize: 12, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
        {ok ? (duplicate ? 'Duplicado' : 'Válido') : 'Inválido'}
      </div>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: '#F8F9FA',
  fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a',
  display: 'grid', gridTemplateRows: '60px 1fr',
};
const topBarStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 24px', borderBottom: '1px solid #E2E8F0', background: '#fff',
};
const logoStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 9, background: '#0f172a', color: '#fff',
  display: 'grid', placeItems: 'center',
};
const bodyStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) minmax(360px, 1fr)',
  gap: 24, padding: 24, overflow: 'auto',
};
const schemaColStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', minWidth: 0,
};
const inputColStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', minWidth: 0,
};
const h2Style: React.CSSProperties = {
  fontSize: 20, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em',
};
const subStyle: React.CSSProperties = {
  fontSize: 13, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5,
};
const preStyle: React.CSSProperties = {
  flex: 1, margin: 0, padding: 16, borderRadius: 12, background: '#0f172a', color: '#E2E8F0',
  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.55,
  overflow: 'auto', maxHeight: 'calc(100vh - 220px)',
};
const textareaStyle: React.CSSProperties = {
  width: '100%', minHeight: 200, padding: 12, borderRadius: 10,
  border: '1px solid #E2E8F0', background: '#fff',
  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.5,
  color: '#0f172a', resize: 'vertical', outline: 'none',
};
const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '8px 14px', borderRadius: 9, border: 'none',
  background: '#0f172a', color: '#fff', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
};
const ghostBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 12px', borderRadius: 9, border: '1px solid #E2E8F0',
  background: '#fff', color: '#0f172a', fontSize: 13, fontWeight: 500,
  cursor: 'pointer',
};
const fileBtnStyle: React.CSSProperties = {
  ...ghostBtnStyle, cursor: 'pointer',
};
const errorBoxStyle: React.CSSProperties = {
  marginTop: 12, padding: 12, borderRadius: 10,
  background: '#FEF2F2', color: '#991B1B',
  border: '1px solid #FECACA', fontSize: 13,
};
const summaryStyle: React.CSSProperties = {
  display: 'flex', gap: 8, marginTop: 18, marginBottom: 12, flexWrap: 'wrap',
};
const listStyle: React.CSSProperties = {
  border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff', overflow: 'hidden',
};
const resultBoxStyle: React.CSSProperties = {
  marginTop: 18, padding: 14, borderRadius: 10,
  background: '#F0FDF4', color: '#064E3B', border: '1px solid #BBF7D0', fontSize: 14,
};
const loadingStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
  background: '#F8F9FA', color: '#94A3B8', fontSize: 14,
  fontFamily: 'Inter, system-ui, sans-serif',
};
