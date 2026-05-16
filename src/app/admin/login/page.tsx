'use client';
// ── /admin/login ──────────────────────────────────────────────────────────
import { useRouter } from 'next/navigation';
import LoginScreen from '@/components/LoginScreen';

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = (user: { email: string }) => {
    // TODO: replace with real Firebase Auth — store session in cookie/localStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('edudisplay-user', JSON.stringify(user));
    }
    router.push('/admin');
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <LoginScreen onLogin={handleLogin} />
    </div>
  );
}
