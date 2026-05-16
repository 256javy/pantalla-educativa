'use client';
// ── /admin ────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminEmail } from '@/lib/admin-whitelist';
import { useCards } from '@/lib/use-cards';
import { SEED } from '@/lib/seed-data';
import AdminPanel from '@/components/AdminPanel';
import type { Card } from '@/lib/types';

const SEED_WITH_IDS: Card[] = SEED.map((card, i) => ({
  ...card,
  id: `c-${i + 1}`,
}));

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setChecked(true);
      if (u && isAdminEmail(u.email)) {
        setUser(u);
      } else {
        if (u) {
          // Autenticado pero sin permisos → out
          void signOut(auth);
        }
        router.replace('/admin/login');
      }
    });
    return () => unsub();
  }, [router]);

  const { cards, loading } = useCards();
  const items = (!loading && cards.length > 0) ? cards : SEED_WITH_IDS;

  if (!checked || !user) {
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  const handleOpenTV = () => router.push('/display');
  const handleOpenImport = () => router.push('/admin/import');

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <AdminPanel
        user={{ email: user.email ?? 'sin-email' }}
        onLogout={handleLogout}
        onOpenTV={handleOpenTV}
        onOpenImport={handleOpenImport}
        initialItems={items}
      />
    </div>
  );
}
