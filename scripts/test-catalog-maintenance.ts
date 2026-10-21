import assert from 'node:assert/strict';
import { connectFirestoreEmulator, writeBatch, doc, getDoc, updateDoc } from 'firebase/firestore';

async function main() {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'demo-api-key';
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-pantalla-catalog';
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'demo-pantalla';
  const { db, app } = await import('../src/lib/firebase');
  assert.equal(app.options.projectId, 'demo-pantalla-catalog');
  connectFirestoreEmulator(db, '127.0.0.1', 8188);
  const { readCatalog, fingerprint, replaceCatalog, restoreCatalog, visibleDocuments } = await import('../src/lib/catalog-maintenance');
  for (let start = 0; start < 805; start += 400) {
    const batch = writeBatch(db);
    for (let i = start; i < Math.min(start + 400, 805); i++) batch.set(doc(db, 'cards', `d${String(i).padStart(3, '0')}`), { title: `Original ${i}`, active: i % 2 === 0, refCode: `A${i}`, custom: { preserve: i }, denyArchive: false });
    await batch.commit();
  }
  const before = await readCatalog();
  assert.equal(before.count, 805);
  const hash = await fingerprint(before);
  await updateDoc(doc(db, 'cards', 'd000'), { title: 'Cambio concurrente' });
  await assert.rejects(replaceCatalog(before, hash, () => {}), /cambió/);
  assert.equal((await readCatalog()).count, 805, 'El respaldo obsoleto no inicia escrituras');
  const fresh = await readCatalog();
  const after = await replaceCatalog(fresh, await fingerprint(fresh), () => {});
  const visible = visibleDocuments(after);
  assert.equal(visible.length, 30);
  assert.equal(after.count, 835, 'Los originales se conservan');
  assert.ok(after.documents.filter((d) => d.id.startsWith('d')).every((d) => d.data.active === false));
  const release = visible[0].data.catalogRelease;
  const restored = await restoreCatalog(release);
  assert.equal(visibleDocuments(restored).length, 805);
  for (const original of fresh.documents) assert.deepEqual((await getDoc(doc(db, 'cards', original.id))).data(), original.data, 'La restauración conserva todos los campos originales');
  // Emulator rules reject archiving d401 when this flag is true; earlier batches must be restored.
  await updateDoc(doc(db, 'cards', 'd401'), { denyArchive: true });
  const failing = await readCatalog();
  await assert.rejects(replaceCatalog(failing, await fingerprint(failing), () => {}));
  const recovered = visibleDocuments(await readCatalog());
  assert.equal(recovered.length, 805);
  assert.ok(recovered.every((d) => d.id.startsWith('d')));
  console.log('805 originales: respaldo obsoleto bloqueado, sustitución 30/805, restauración íntegra y recuperación tras fallo en segundo lote correctos.');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
