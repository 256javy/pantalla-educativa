'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminEmail } from '@/lib/admin-whitelist';
import catalog from '@/lib/catalogo-visual-v1.json';
import { fingerprint, readCatalog, replaceCatalog, restoreCatalog, visibleDocuments, type CatalogBackup } from '@/lib/catalog-maintenance';

export default function CatalogPage() {
  const [authorized, setAuthorized] = useState(false);
  const [backup, setBackup] = useState<CatalogBackup | null>(null);
  const [hash, setHash] = useState('');
  const [url, setUrl] = useState('');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  useEffect(() => onAuthStateChanged(auth, (u) => {
    if (!isAdminEmail(u?.email)) { window.location.replace('/admin/login'); return; }
    setAuthorized(true);
  }), []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const prepare = async () => {
    setBusy(true); setError(''); setVerified(false); setFinished(false);
    try {
      const snapshot = await readCatalog();
      const digest = await fingerprint(snapshot);
      setBackup(snapshot); setHash(digest);
      setUrl(URL.createObjectURL(new Blob([JSON.stringify({ ...snapshot, sha256: digest }, null, 2)], { type: 'application/json' })));
      setStatus(`Respaldo preparado: ${snapshot.count} documentos, ${visibleDocuments(snapshot).length} visibles.`);
    } catch (e) { setError(String(e)); }
    finally { setBusy(false); }
  };
  const replace = async () => {
    if (!backup || !verified || !hash) return;
    setBusy(true); setError('');
    try { await replaceCatalog(backup, hash, setStatus); setFinished(true); }
    catch (e) { setError(String(e)); }
    finally { setBusy(false); }
  };
  const restore = async (release: string) => {
    setBusy(true); setError('');
    try { const after = await restoreCatalog(release); setStatus(`Restauración verificada: ${visibleDocuments(after).length} tarjetas visibles.`); setFinished(true); }
    catch (e) { setError(String(e)); }
    finally { setBusy(false); }
  };
  if (!authorized) return <p>Cargando…</p>;
  const releases = backup ? [...new Set(backup.documents.map((d) => d.data.catalogArchive).filter((v): v is string => typeof v === 'string' && /^replace-/.test(v) && !v.endsWith('-staged')))] : [];
  return <main style={{ maxWidth: 960, margin: '32px auto', padding: 24, color: '#172033', fontFamily: 'system-ui' }}>
    <a href="/admin">Volver al administrador</a>
    <h1>Renovar el catálogo educativo</h1>
    <p>El nuevo catálogo contiene 15 tarjetas con imagen y 15 quizzes con opciones y explicación. Las anteriores se archivan y dejan de aparecer en la pantalla y el administrador. Se conservan sus documentos para restaurarlas.</p>
    <button disabled={busy} onClick={prepare} style={{ padding: 12 }}>1. Preparar respaldo completo</button>
    {backup && <section style={{ marginTop: 20, padding: 20, border: '1px solid #cbd5e1', borderRadius: 12 }}>
      <h2>Respaldo de producción</h2>
      <p>Proyecto: {backup.projectId}. Documentos: {backup.count}. Visibles: {visibleDocuments(backup).length}.</p>
      <p style={{ overflowWrap: 'anywhere' }}>SHA-256: <code>{hash}</code></p>
      <a href={url} download={`pantalla-educativa-respaldo-${backup.capturedAt.replace(/[:.]/g, '-')}.json`}>Descargar respaldo JSON</a>
      <p><label><input type="checkbox" checked={verified} disabled={busy} onChange={(e) => setVerified(e.target.checked)} /> He descargado y verificado el respaldo completo.</label></p>
      <button disabled={busy || !verified || finished} onClick={replace} style={{ padding: 12 }}>2. Archivar anteriores y publicar las 30 nuevas</button>
      {releases.map((release) => <p key={release}><button disabled={busy || !verified} onClick={() => restore(release)}>Restaurar catálogo anterior: {release}</button></p>)}
    </section>}
    <p role="status" aria-live="polite">{busy ? 'Operación en curso. ' : ''}{status}</p>
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    <h2>Contenido nuevo</h2>
    <ul>{catalog.map((c) => <li key={c.refCode}>{c.refCode} · {c.title} · {c.type === 'QUIZ' ? 'Quiz con opciones' : 'Imagen con créditos'}</li>)}</ul>
  </main>;
}
