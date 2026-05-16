'use client';
// ── /admin ────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCards } from '@/lib/use-cards';
import { SEED } from '@/lib/seed-data';
import AdminPanel from '@/components/AdminPanel';
import type { Card } from '@/lib/types';

// Seed data with IDs for fallback
const SEED_WITH_IDS: Card[] = SEED.map((card, i) => ({
  ...card,
  id: `c-${i + 1}`,
}));

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Simple session guard — replace with real Firebase Auth check
    try {
      const stored = sessionStorage.getItem('edudisplay-user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  }, [router]);

  const { cards, loading } = useCards();
  const items = (!loading && cards.length > 0) ? cards : SEED_WITH_IDS;

  if (!user) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
        background: '#F8F9FA', color: '#94A3B8', fontSize: 14,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        Cargando…
      </div>
    );
  }

  const handleLogout = () => {
    try { sessionStorage.removeItem('edudisplay-user'); } catch {}
    router.push('/admin/login');
  };

  const handleOpenTV = () => {
    router.push('/display');
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <AdminPanel
        user={user}
        onLogout={handleLogout}
        onOpenTV={handleOpenTV}
        initialItems={items}
      />
    </div>
  );
}
