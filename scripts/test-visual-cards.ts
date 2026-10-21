import { quizDuration, quizAnswerDuration } from '../src/lib/quiz-timing';
import type { Card } from '../src/lib/types';
import assert from 'node:assert/strict';
import { validateCardInput, parseImportPayload, CARD_JSON_SCHEMA } from '../src/lib/card-schema';
import visuals from '../src/lib/visual-library.json';
import { existsSync } from 'node:fs';

const legacy = { type: 'QUIZ', title: 'Luna', content: '¿Nuestro satélite?', answer: 'La Luna.', active: false, frequency: 'MEDIUM' };
assert.equal(validateCardInput(legacy).ok, true, 'Las tarjetas existentes siguen siendo válidas');
const structured = { ...legacy, quiz: { options: ['Sol', 'Luna'], correctIndex: 1, seconds: 20 } };
const result = parseImportPayload(JSON.stringify([structured])).items[0].result;
assert.equal(result.ok, true);
if (result.ok) assert.deepEqual(result.card.quiz, structured.quiz, 'Importar conserva opciones, índice y tiempo');
for (const quiz of [
  { ...structured.quiz, options: ['Solo una'] },
  { ...structured.quiz, options: ['Sol', ' '] },
  { ...structured.quiz, correctIndex: 2 },
  { ...structured.quiz, correctIndex: 0.5 },
  { ...structured.quiz, seconds: 9 },
  { ...structured.quiz, seconds: 61 },
  { ...structured.quiz, surprise: true },
  'invalid',
]) assert.equal(validateCardInput({ ...legacy, quiz }).ok, false);
assert.equal(validateCardInput({ ...structured, type: 'FACT' }).ok, false);
assert.equal(validateCardInput({ ...legacy, quiz: null, imageId: null }).ok, true);
assert.equal(validateCardInput({ ...legacy, imageId: 'missing-image' }).ok, false);
assert.equal(new Set(visuals.map((v) => v.id)).size, 15);
for (const visual of visuals) {
  assert.ok(existsSync(`public${visual.src}`));
  assert.ok(visual.author && visual.source.startsWith('https://commons.wikimedia.org/') && visual.license);
  assert.equal(validateCardInput({ ...legacy, type: 'HISTORY', answer: '', imageId: visual.id }).ok, true);
}
assert.ok(CARD_JSON_SCHEMA.items.properties.quiz);
console.log('Compatibilidad, importación, casos inválidos y 15 recursos verificados.');

assert.equal(quizDuration(), 15);
assert.equal(quizAnswerDuration(), 6);
const timed = { ...structured, id: 'test', refCode: 'Z01' } as Card;
assert.equal(quizDuration(timed), 20);
assert.equal(quizAnswerDuration(timed), 12);
assert.equal(quizDuration({ ...timed, quiz: { ...timed.quiz!, seconds: NaN } }), 15);
assert.equal(quizDuration({ ...timed, quiz: { ...timed.quiz!, seconds: 999 } }), 60);

import replacement from '../src/lib/catalogo-visual-v1.json';
assert.equal(replacement.length, 30);
assert.equal(new Set(replacement.map((c) => c.refCode)).size, 30);
for (const card of replacement) assert.equal(validateCardInput(card).ok, true, card.title);
assert.equal(replacement.filter((c) => 'imageId' in c).length, 15);
assert.equal(replacement.filter((c) => 'quiz' in c).length, 15);
assert.ok(replacement.every((c) => c.active && (c.type === 'QUIZ' ? 'quiz' in c : 'imageId' in c)));
console.log('30 píldoras nuevas: 15 imágenes y 15 quizzes válidos, todas activas.');
