'use client';
// ── /admin/login ──────────────────────────────────────────────────────────
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoginScreen from '@/components/LoginScreen';
import { isAdminEmail } from '@/lib/admin-whitelist';

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = async (user: { email: string; uid: string }) => {
    if (!isAdminEmail(user.email)) {
      await signOut(auth);
      throw new Error(
        `La cuenta ${user.email} no está autorizada para acceder al panel.`
      );
    }
    router.push('/admin');
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <LoginScreen onLogin={handleLogin} />
    </div>
  );
}
