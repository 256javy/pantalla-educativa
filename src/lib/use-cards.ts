'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Card } from './types';

interface UseCardsOptions {
  onlyActive?: boolean;
}

export function useCards(opts?: UseCardsOptions): {
  cards: Card[];
  loading: boolean;
  error: Error | null;
} {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const cardsRef = collection(db, 'cards');

      const q = opts?.onlyActive
        ? query(cardsRef, where('active', '==', true), orderBy('refCode'))
        : query(cardsRef, orderBy('refCode'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Card[];

          setCards(data);
          setLoading(false);
        },
        (err) => {
          // Sin este handler los errores de la query (permission denied,
          // índice faltante, network) se tragaban en silencio y la app
          // mostraba siempre el SEED de fallback.
          console.error('[useCards] onSnapshot error:', err.code, err.message);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('[useCards] setup error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [opts?.onlyActive]);

  return { cards, loading, error };
}
