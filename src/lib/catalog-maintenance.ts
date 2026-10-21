import { collection, deleteField, doc, getDocsFromServer, writeBatch, Timestamp, type DocumentData } from 'firebase/firestore';
import { db, app } from './firebase';
import { validateCardInput } from './card-schema';
import catalog from './catalogo-visual-v1.json';

export interface CatalogDocument { id: string; data: DocumentData }
export interface CatalogBackup {
  format: 'pantalla-educativa-backup-v1';
  projectId: string;
  capturedAt: string;
  count: number;
  documents: CatalogDocument[];
}

export async function readCatalog(): Promise<CatalogBackup> {
  const snapshot = await getDocsFromServer(collection(db, 'cards'));
  const documents = snapshot.docs.map((d) => ({ id: d.id, data: d.data() })).sort((a, b) => a.id.localeCompare(b.id));
  return { format: 'pantalla-educativa-backup-v1', projectId: app.options.projectId || '', capturedAt: new Date().toISOString(), count: documents.length, documents };
}

export async function fingerprint(backup: CatalogBackup): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify({ projectId: backup.projectId, documents: backup.documents }));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function visibleDocuments(backup: CatalogBackup) {
  return backup.documents.filter((d) => !d.data.catalogArchive);
}

async function patchAll(documents: CatalogDocument[], patch: DocumentData | ((d: CatalogDocument) => DocumentData), progress?: (n: number) => void) {
  for (let i = 0; i < documents.length; i += 400) {
    const batch = writeBatch(db);
    documents.slice(i, i + 400).forEach((d) => batch.update(doc(db, 'cards', d.id), typeof patch === 'function' ? patch(d) : patch));
    await batch.commit();
    progress?.(Math.min(i + 400, documents.length));
  }
}

/** Reversible: hide the replacement and reveal the untouched original documents. */
export async function restoreCatalog(release: string): Promise<CatalogBackup> {
  const current = await readCatalog();
  const originals = current.documents.filter((d) => d.data.catalogArchive === release);
  const replacements = current.documents.filter((d) => d.data.catalogRelease === release);
  if (replacements.some((d) => typeof d.data.catalogArchive === 'string' && d.data.catalogArchive.startsWith('replace-') && d.data.catalogArchive !== `${release}-staged`)) throw new Error('Esta sustitución tiene otra posterior. Restaura primero la más reciente.');
  if (!originals.length) throw new Error('No se encontró el catálogo anterior para esta sustitución.');
  await patchAll(replacements, { catalogArchive: `rollback-${release}`, active: false });
  await patchAll(originals, (d) => ({ catalogArchive: deleteField(), active: d.data.catalogOriginalActive ?? d.data.active, catalogOriginalActive: deleteField() }));
  const restored = await readCatalog();
  if (restored.documents.some((d) => d.data.catalogArchive === release)) throw new Error('Restauración incompleta; vuelve a intentarlo.');
  return restored;
}

export async function replaceCatalog(backup: CatalogBackup, expectedHash: string, report: (s: string) => void): Promise<CatalogBackup> {
  if (!backup.count || backup.count !== backup.documents.length) throw new Error('Respaldo vacío o incompleto.');
  const parsed = catalog.map(validateCardInput);
  if (parsed.some((r) => !r.ok) || catalog.length !== 30 || new Set(catalog.map((c) => c.refCode)).size !== 30) throw new Error('El nuevo catálogo no supera la validación.');
  if (catalog.some((c) => c.type === 'QUIZ' ? !('quiz' in c) : !('imageId' in c))) throw new Error('Todas las tarjetas deben usar las nuevas capacidades.');
  const fresh = await readCatalog();
  if (fresh.projectId !== backup.projectId || await fingerprint(fresh) !== expectedHash || await fingerprint(backup) !== expectedHash) throw new Error('El catálogo cambió desde el respaldo. Descarga un respaldo nuevo antes de continuar.');
  const originals = visibleDocuments(fresh);
  const release = `replace-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const staged = writeBatch(db);
  parsed.forEach((r, i) => {
    if (!r.ok) throw new Error('Tarjeta inválida');
    staged.set(doc(db, 'cards', `${release}-${i + 1}`), { ...r.card, active: false, catalogArchive: `${release}-staged`, catalogRelease: release, createdAt: Timestamp.now() });
  });
  await staged.commit();
  try {
    report('Nuevo catálogo preparado; archivando el anterior…');
    await patchAll(originals, (d) => ({ catalogArchive: release, catalogOriginalActive: d.data.active ?? false, active: false }), (n) => report(`Archivadas ${n} de ${originals.length} tarjetas anteriores…`));
    const activate = writeBatch(db);
    catalog.forEach((_, i) => activate.update(doc(db, 'cards', `${release}-${i + 1}`), { catalogArchive: deleteField(), active: catalog[i].active }));
    await activate.commit();
    const after = await readCatalog();
    const visible = visibleDocuments(after);
    if (visible.length !== 30 || visible.some((d) => d.data.catalogRelease !== release) || originals.some((o) => !after.documents.some((d) => d.id === o.id && d.data.catalogArchive === release))) throw new Error('La comprobación final del catálogo no coincide.');
    report(`Verificado: 30 tarjetas nuevas visibles; ${originals.length} originales archivadas. Restauración: ${release}`);
    return after;
  } catch (error) {
    report('La sustitución falló. Restaurando las tarjetas anteriores…');
    // Restore exactly the originals, including those not yet archived, without removing content.
    const stagedDocs = catalog.map((_, i) => ({ id: `${release}-${i + 1}`, data: {} }));
    await patchAll(stagedDocs, { catalogArchive: `rollback-${release}`, active: false });
    await patchAll(originals, (d) => ({ catalogArchive: deleteField(), active: d.data.active, catalogOriginalActive: deleteField() }));
    throw error;
  }
}
