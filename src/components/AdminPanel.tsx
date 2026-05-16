'use client';
// ── EduDisplay · Admin Desktop (CRUD) ─────────────────────────────────────
import React, { useMemo, useState } from 'react';
import { CATEGORIES, FREQ_LABEL, FREQ_BARS } from '@/lib/categories';
import type { Card, CardType, Frequency } from '@/lib/types';
import { createCard, updateCard, deleteCard, toggleActive } from '@/lib/cards-repo';
import Icon from './Icon';
import CardRenderer, { defaultVariantFor } from './CardRenderer';

// ── helpers ────────────────────────────────────────────────────────────────
function nextRefCode(items: Card[], type: CardType): string {
  const prefix: Record<CardType, string> = { FACT: 'A', HISTORY: 'H', QUOTE: 'Q', QUIZ: 'Z', HUMOR: 'X' };
  const p = prefix[type] || 'X';
  const existing = items.filter((x) => x.refCode?.startsWith(p)).length;
  return `${p}${String(60 + existing).padStart(2, '0')}`;
}

// ── AdminTopBar ────────────────────────────────────────────────────────────
interface AdminTopBarProps {
  user: { email: string };
  onLogout?: () => void;
  onOpenTV?: () => void;
}

function AdminTopBar({ user, onLogout, onOpenTV }: AdminTopBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid #E2E8F0',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 9, background: '#0f172a', color: '#fff',
            display: 'grid', placeItems: 'center',
          }}
        >
          <Icon name="logo" size={20} />
        </div>
        <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>EduDisplay</span>
        <span style={{ color: '#94A3B8', fontSize: 13, marginLeft: 8 }}>· panel</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onOpenTV}
          style={{
            padding: '8px 14px', borderRadius: 9, border: '1px solid #E2E8F0',
            background: '#fff', color: '#0f172a', fontSize: 13, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}
        >
          <Icon name="tv" size={16} /> Ver pantalla
        </button>
        <div style={{ width: 1, height: 24, background: '#E2E8F0', margin: '0 6px' }} />
        <div style={{ fontSize: 13, color: '#475569' }}>{user.email}</div>
        <button
          onClick={onLogout}
          style={{
            padding: '6px 12px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#64748B', fontSize: 13, cursor: 'pointer',
          }}
        >
          Salir
        </button>
      </div>
    </div>
  );
}

// ── AdminSidebar ────────────────────────────────────────────────────────────
interface AdminSidebarProps {
  filterCat: string;
  setFilterCat: (v: string) => void;
  filterState: string;
  setFilterState: (v: string) => void;
  counts: Record<string, number>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600, padding: '0 8px' }}>
      {children}
    </div>
  );
}

interface CatRowProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
  dot: string;
  icon?: string;
}

function CatRow({ label, active, onClick, count, dot, icon }: CatRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 8,
        border: 'none',
        background: active ? '#F1F5F9' : 'transparent',
        color: '#0f172a',
        fontSize: 14, fontWeight: active ? 600 : 500,
        cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.15s',
        width: '100%',
      }}
    >
      <span
        style={{
          width: 18, height: 18, borderRadius: 5,
          background: dot + '22', color: dot,
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}
      >
        {icon && <Icon name={icon} size={12} strokeWidth={2.4} />}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
    </button>
  );
}

function AdminSidebar({ filterCat, setFilterCat, filterState, setFilterState, counts }: AdminSidebarProps) {
  return (
    <aside
      style={{
        borderRight: '1px solid #E2E8F0',
        background: '#fff',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        overflow: 'auto',
      }}
    >
      <div>
        <SectionLabel>Categoría</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          <CatRow label="Todas" active={filterCat === 'ALL'} onClick={() => setFilterCat('ALL')} count={counts.ALL || 0} dot="#94A3B8" />
          {Object.values(CATEGORIES).map((c) => (
            <CatRow
              key={c.key}
              label={c.label}
              active={filterCat === c.key}
              onClick={() => setFilterCat(c.key)}
              count={counts[c.key] || 0}
              dot={c.accent}
              icon={c.glyph}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Estado</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ACTIVE', label: 'Activos' },
            { id: 'INACTIVE', label: 'Pausados' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterState(opt.id)}
              style={{
                flex: 1, padding: '6px 8px', borderRadius: 8,
                border: '1px solid ' + (filterState === opt.id ? '#0f172a' : '#E2E8F0'),
                background: filterState === opt.id ? '#0f172a' : '#fff',
                color: filterState === opt.id ? '#fff' : '#475569',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
        Sincronizado con<br />
        <strong style={{ color: '#475569', fontWeight: 600 }}>Firebase</strong> · onSnapshot<br />
        <span style={{ color: '#10B981' }}>● en línea</span>
      </div>
    </aside>
  );
}

// ── FrequencyBars ──────────────────────────────────────────────────────────
function FrequencyBars({ freq }: { freq: Frequency }) {
  const n = FREQ_BARS[freq] || 0;
  const tone = freq === 'HIGH' ? '#059669' : freq === 'MEDIUM' ? '#2563EB' : '#94A3B8';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, width: 28, height: 18 }} title={`Frecuencia: ${FREQ_LABEL[freq]}`}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: i * 5 + 3,
            borderRadius: 2,
            background: i <= n ? tone : '#E2E8F0',
          }}
        />
      ))}
    </div>
  );
}

// ── AdminList ──────────────────────────────────────────────────────────────
interface AdminListProps {
  items: Card[];
  selected: Card | null;
  onSelect: (it: Card) => void;
  onDelete: (id: string) => void;
  query: string;
  setQuery: (v: string) => void;
  onCreate: () => void;
  totalShown: number;
  totalAll: number;
}

function AdminList({ items, selected, onSelect, onDelete, query, setQuery, onCreate, totalShown, totalAll }: AdminListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          padding: '20px 28px 14px',
          borderBottom: '1px solid #E2E8F0',
          background: '#fff',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
            <Icon name="search" size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por texto, título o #REF"
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              borderRadius: 9, border: '1px solid #E2E8F0',
              fontSize: 14, outline: 'none', background: '#F8FAFC',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <button
          onClick={onCreate}
          style={{
            padding: '10px 14px', borderRadius: 9, border: 'none',
            background: '#0f172a', color: '#fff', fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}
        >
          <Icon name="plus" size={16} strokeWidth={2.4} /> Nueva
        </button>
      </div>

      <div style={{ padding: '8px 28px', fontSize: 12, color: '#94A3B8', background: '#fff' }}>
        Mostrando {totalShown} de {totalAll}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 24px', background: '#F8F9FA' }}>
        {items.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
            Sin resultados con los filtros actuales.
          </div>
        )}
        {items.map((it) => {
          const cat = CATEGORIES[it.type];
          const isSel = selected && selected.id === it.id;
          return (
            <div
              key={it.id}
              onClick={() => onSelect(it)}
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr auto auto auto',
                alignItems: 'center',
                gap: 16,
                padding: '14px 16px',
                background: isSel ? '#fff' : 'rgba(255,255,255,0.5)',
                borderRadius: 12,
                border: '1px solid ' + (isSel ? cat.accent : '#E2E8F0'),
                boxShadow: isSel ? `0 0 0 3px ${cat.accent}1a` : 'none',
                marginBottom: 6,
                cursor: 'pointer',
                transition: 'all 0.15s',
                opacity: it.active ? 1 : 0.55,
              }}
            >
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 999,
                  background: cat.bg, color: cat.accent,
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  width: 'fit-content',
                }}
              >
                <Icon name={cat.glyph} size={12} strokeWidth={2.4} />
                {cat.label}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                  {it.title || <em style={{ color: '#94A3B8' }}>sin título</em>}
                </div>
                <div
                  style={{
                    fontSize: 13, color: '#64748B',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {it.content.replace(/\*\*/g, '')}
                </div>
              </div>
              <FrequencyBars freq={it.frequency} />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, color: '#94A3B8',
                  background: '#F1F5F9', padding: '4px 8px', borderRadius: 6,
                }}
              >
                #{it.refCode}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(it.id); }}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: 'transparent', color: '#94A3B8', cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                }}
                aria-label="eliminar"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LivePreview ──────────────────────────────────────────────────────────
function LivePreview({ item, cat }: { item: Card; cat: import('@/lib/types').Category }) {
  const targetW = 472;
  const targetH = targetW * 9 / 16;
  const scale = targetW / 1920;
  return (
    <div
      style={{
        position: 'relative',
        width: targetW,
        height: targetH,
        borderRadius: 14,
        overflow: 'hidden',
        background: cat.bg,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 20px 40px -20px rgba(15,23,42,0.18)',
        border: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: 1920, height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <CardRenderer
          variant={defaultVariantFor(item.type)}
          item={{ ...item, content: item.content || 'Escribe el contenido…' }}
          cat={cat}
          progress={0.42}
          quizState={item.type === 'QUIZ' ? 'question' : null}
          quizProgress={0.5}
          quizSeconds={8}
          fontScale={1}
        />
      </div>
      <div
        style={{
          position: 'absolute', bottom: 8, right: 10,
          fontSize: 10, color: cat.ink, opacity: 0.55,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}
      >
        Preview · auto
      </div>
    </div>
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────
interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        border: 'none', background: 'transparent', cursor: 'pointer',
        padding: 0, color: value ? '#059669' : '#94A3B8',
        fontSize: 13, fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 36, height: 20, borderRadius: 999,
          background: value ? '#10B981' : '#CBD5E1',
          position: 'relative',
          transition: 'background 0.15s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2, left: value ? 18 : 2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'left 0.15s',
          }}
        />
      </span>
      {label}
    </button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, hint, children }: SectionProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>
          {title}
        </span>
        {hint && <span style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  border: '1px solid #E2E8F0', background: '#F8FAFC',
  fontSize: 14, outline: 'none', color: '#0f172a',
};

// ── AdminEditor ────────────────────────────────────────────────────────────
interface AdminEditorProps {
  item: Card | null;
  onChange: (patch: Partial<Card>) => void;
  isCreating: boolean;
  onSave: () => void;
  onCancel: () => void;
}

function AdminEditor({ item, onChange, isCreating, onSave, onCancel }: AdminEditorProps) {
  if (!item) {
    return (
      <aside style={{ background: '#fff', borderLeft: '1px solid #E2E8F0', display: 'grid', placeItems: 'center', color: '#94A3B8' }}>
        Selecciona un contenido.
      </aside>
    );
  }
  const cat = CATEGORIES[item.type];
  const maxChars = 180;
  const charCount = item.content.length;
  const over = charCount > maxChars;

  return (
    <aside
      style={{
        background: '#fff',
        borderLeft: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'auto',
      }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600 }}>
            {isCreating ? 'Nuevo contenido' : 'Editando'}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
            #REF-{item.refCode}
          </div>
        </div>
        <Toggle value={item.active} onChange={(v) => onChange({ active: v })} label="Activo" />
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Section title="Categoría">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {Object.values(CATEGORIES).map((c) => {
              const sel = item.type === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => onChange({ type: c.key })}
                  style={{
                    padding: '8px 4px', borderRadius: 9,
                    border: '1px solid ' + (sel ? c.accent : '#E2E8F0'),
                    background: sel ? c.bg : '#fff',
                    color: sel ? c.accent : '#475569',
                    fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon name={c.glyph} size={16} strokeWidth={2.2} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Título (opcional)">
          <input
            value={item.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="ej. Cuerpo humano"
            style={fieldStyle}
          />
        </Section>

        <Section
          title="Contenido"
          hint={
            <span style={{ color: over ? '#E11D48' : '#94A3B8' }}>
              {charCount}/{maxChars}
            </span>
          }
        >
          <textarea
            value={item.content}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={3}
            placeholder="Usa **palabras** para resaltarlas en color de acento."
            style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
          />
        </Section>

        {item.type === 'QUIZ' && (
          <Section title="Respuesta">
            <textarea
              value={item.answer}
              onChange={(e) => onChange({ answer: e.target.value })}
              rows={2}
              placeholder="Se revela tras los 15 s."
              style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </Section>
        )}

        <Section title="Frecuencia de aparición">
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              { id: 'LOW', label: 'Baja', hint: 'rara vez' },
              { id: 'MEDIUM', label: 'Media', hint: 'rotación estándar' },
              { id: 'HIGH', label: 'Alta', hint: 'se ve seguido' },
            ] as { id: Frequency; label: string; hint: string }[]).map((opt) => {
              const sel = item.frequency === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChange({ frequency: opt.id })}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 9,
                    border: '1px solid ' + (sel ? '#0f172a' : '#E2E8F0'),
                    background: sel ? '#0f172a' : '#fff',
                    color: sel ? '#fff' : '#475569',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}
                >
                  <span style={{ display: 'flex', gap: 3, marginBottom: 2 }}>
                    {[1,2,3].map((i) => (
                      <span key={i} style={{
                        width: 4, height: 4 + i*3, borderRadius: 1,
                        background: i <= FREQ_BARS[opt.id] ? (sel ? '#fff' : '#0f172a') : (sel ? 'rgba(255,255,255,0.3)' : '#CBD5E1'),
                      }} />
                    ))}
                  </span>
                  {opt.label}
                  <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{opt.hint}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Live Preview · 16:9">
          <LivePreview item={item} cat={cat} />
        </Section>

        {isCreating ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: '12px', borderRadius: 9,
                border: '1px solid #E2E8F0', background: '#fff', color: '#475569',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              style={{
                flex: 2, padding: '12px', borderRadius: 9, border: 'none',
                background: '#0f172a', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Icon name="check" size={16} strokeWidth={2.4} /> Publicar
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: '8px 0' }}>
            Cambios guardados automáticamente
          </div>
        )}
      </div>
    </aside>
  );
}

// ── AdminPanel · componente principal ─────────────────────────────────────
interface AdminPanelProps {
  user?: { email: string };
  onLogout?: () => void;
  onOpenTV?: () => void;
  initialItems?: Card[];
}

export default function AdminPanel({
  user = { email: 'familia@edudisplay.app' },
  onLogout,
  onOpenTV,
  initialItems = [],
}: AdminPanelProps) {
  const [items, setItems] = useState<Card[]>(() => initialItems.map((x) => ({ ...x })));
  const [selectedId, setSelectedId] = useState<string | null>(initialItems[0]?.id ?? null);
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterState, setFilterState] = useState('ALL');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState<Card | false>(false);

  // Keep items in sync when parent passes new data (e.g. from Firestore)
  React.useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems.map((x) => ({ ...x })));
    }
  }, [initialItems]);

  const filtered = items.filter((it) => {
    if (filterCat !== 'ALL' && it.type !== filterCat) return false;
    if (filterState === 'ACTIVE' && !it.active) return false;
    if (filterState === 'INACTIVE' && it.active) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!(it.title.toLowerCase().includes(q) ||
            it.content.toLowerCase().includes(q) ||
            it.refCode.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const selected: Card | null = creating
    ? (creating as Card)
    : filtered.find((x) => x.id === selectedId) || filtered[0] || items[0] || null;

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length };
    Object.keys(CATEGORIES).forEach((k) => (c[k] = 0));
    items.forEach((it) => { c[it.type] = (c[it.type] || 0) + 1; });
    return c;
  }, [items]);

  const update = (patch: Partial<Card>) => {
    if (creating) {
      setCreating((c) => c ? ({ ...c, ...patch }) : c);
    } else if (selected) {
      // Optimistic update
      setItems((arr) => arr.map((it) => (it.id === selected.id ? { ...it, ...patch } : it)));
      // Firestore update (fire-and-forget)
      updateCard(selected.id, patch).catch(console.error);
    }
  };

  const onSave = async () => {
    if (!creating) return;
    try {
      const draft = creating as Card;
      const newId = await createCard({
        type: draft.type,
        title: draft.title,
        content: draft.content,
        answer: draft.answer,
        refCode: draft.refCode,
        active: draft.active,
        frequency: draft.frequency,
      });
      const newItem: Card = { ...draft, id: newId };
      setItems((arr) => [newItem, ...arr]);
      setSelectedId(newId);
      setCreating(false);
    } catch (err) {
      console.error('Error creating card:', err);
    }
  };

  const onDelete = async (id: string) => {
    setItems((arr) => arr.filter((x) => x.id !== id));
    try {
      await deleteCard(id);
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const handleToggleActive = async (it: Card) => {
    const newActive = !it.active;
    setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, active: newActive } : x)));
    try {
      await toggleActive(it.id, newActive);
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  };

  const startCreate = () => {
    setCreating({
      id: 'draft',
      type: 'FACT',
      title: '',
      content: '',
      answer: '',
      refCode: nextRefCode(items, 'FACT'),
      active: true,
      frequency: 'MEDIUM',
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#F8F9FA',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#0f172a',
        display: 'grid',
        gridTemplateRows: '60px 1fr',
      }}
    >
      <AdminTopBar user={user} onLogout={onLogout} onOpenTV={onOpenTV} />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 520px', minHeight: 0 }}>
        <AdminSidebar
          filterCat={filterCat} setFilterCat={setFilterCat}
          filterState={filterState} setFilterState={setFilterState}
          counts={counts}
        />

        <AdminList
          items={filtered}
          selected={selected}
          onSelect={(it) => { setCreating(false); setSelectedId(it.id); }}
          onDelete={onDelete}
          query={query} setQuery={setQuery}
          onCreate={startCreate}
          totalShown={filtered.length}
          totalAll={items.length}
        />

        <AdminEditor
          item={selected}
          onChange={update}
          isCreating={!!creating}
          onSave={onSave}
          onCancel={() => setCreating(false)}
        />
      </div>
    </div>
  );
}
