import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
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
