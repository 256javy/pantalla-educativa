import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Card, CardType } from './types';

const CARDS_COLLECTION = 'cards';

export async function createCard(
  input: Omit<Card, 'id' | 'refCode'> & { refCode?: string }
): Promise<string> {
  const refCode = input.refCode || generateRefCode(input.type);
  const cardData = {
    ...input,
    refCode,
    createdAt: Timestamp.now(),
  };

  const cardsRef = collection(db, CARDS_COLLECTION);
  const docRef = await addDoc(cardsRef, cardData);
  return docRef.id;
}

export async function updateCard(id: string, patch: Partial<Card>): Promise<void> {
  const cardRef = doc(db, CARDS_COLLECTION, id);
  await updateDoc(cardRef, {
    ...patch,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteCard(id: string): Promise<void> {
  const cardRef = doc(db, CARDS_COLLECTION, id);
  await deleteDoc(cardRef);
}

export async function toggleActive(id: string, active: boolean): Promise<void> {
  await updateCard(id, { active });
}

// Bulk insert con writeBatch. Firestore acepta hasta 500 ops por batch;
// dividimos en chunks y reportamos progreso por chunk. Retorna la lista
// de IDs generados (uno por card en el mismo orden que se pasaron).
export async function createCardsBatch(
  drafts: Array<Omit<Card, 'id' | 'refCode'> & { refCode: string }>,
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const CHUNK = 500;
  const cardsRef = collection(db, 'cards');
  const ids: string[] = [];

  for (let i = 0; i < drafts.length; i += CHUNK) {
    const slice = drafts.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    const localIds: string[] = [];

    for (const draft of slice) {
      const ref = doc(cardsRef);
      localIds.push(ref.id);
      batch.set(ref, {
        ...draft,
        createdAt: Timestamp.now(),
      });
    }

    await batch.commit();
    ids.push(...localIds);
    onProgress?.(Math.min(i + slice.length, drafts.length), drafts.length);
  }

  return ids;
}

export function generateRefCode(type: CardType): string {
  const typeMap: Record<CardType, string> = {
    FACT: 'A',
    HISTORY: 'H',
    QUOTE: 'Q',
    QUIZ: 'Z',
    HUMOR: 'X',
  };

  const prefix = typeMap[type];
  const number = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  return `${prefix}${number}`;
}
