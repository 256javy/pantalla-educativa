import type { Card } from './types';

export function quizDuration(card?: Card): number {
  const seconds = card?.quiz?.seconds;
  return typeof seconds === 'number' && Number.isFinite(seconds) ? Math.min(60, Math.max(10, seconds)) : 15;
}

export function quizAnswerDuration(card?: Card): number {
  return card?.quiz ? 12 : 6;
}
