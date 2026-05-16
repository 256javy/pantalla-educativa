import type { Card, CardType, Frequency } from './types';

// ── JSON Schema (Draft 7) ────────────────────────────────────────────────
// Pensado para pegarlo al prompt de un modelo: incluye descripciones,
// enums, formato esperado y un ejemplo mínimo.

export const CARD_JSON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://edudisplay.local/schemas/card.json',
  title: 'EduDisplay Card',
  description:
    'Tarjeta educativa para la pantalla. El input para importar es un array de objetos sin id (Firestore lo asigna). NO incluyas refCode: el servidor lo genera automáticamente garantizando unicidad.',
  type: 'array',
  items: {
    type: 'object',
    required: ['type', 'title', 'content', 'answer', 'active', 'frequency'],
    additionalProperties: false,
    properties: {
      type: {
        type: 'string',
        enum: ['FACT', 'QUIZ', 'QUOTE', 'HISTORY', 'HUMOR'],
        description:
          'FACT=ciencia, HISTORY=historia, QUOTE=frase/cita, QUIZ=pregunta, HUMOR=chiste.',
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 80,
        description: 'Título corto (1-80 caracteres).',
      },
      content: {
        type: 'string',
        minLength: 1,
        maxLength: 280,
        description:
          'Texto principal. Puedes resaltar una palabra clave envolviéndola con **dobles asteriscos**.',
      },
      answer: {
        type: 'string',
        maxLength: 400,
        description:
          'Solo para QUIZ: la respuesta que aparece tras los 15s. En FACT/QUOTE/HISTORY/HUMOR debe ser "" (string vacío).',
      },
      active: {
        type: 'boolean',
        description: 'true para que la tarjeta entre en la rotación.',
      },
      frequency: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        description: 'Cuán seguido debe aparecer (usado por el motor de rotación).',
      },
      refCode: {
        type: 'string',
        pattern: '^[AHQZX][0-9]{2,3}$',
        description:
          'OPCIONAL — omítelo y el servidor asignará uno único. Formato: prefijo (A=FACT, H=HISTORY, Q=QUOTE, Z=QUIZ, X=HUMOR) + 2 o 3 dígitos. Ej: A20, H07, Z003.',
      },
    },
  },
  examples: [
    [
      {
        type: 'FACT',
        title: 'Cosmos',
        content: 'Una **galaxia** promedio contiene cien mil millones de estrellas.',
        answer: '',
        active: true,
        frequency: 'MEDIUM',
      },
      {
        type: 'QUIZ',
        title: 'Sacramentos',
        content: '¿Cuántos **sacramentos** reconoce la Iglesia Católica?',
        answer: 'Siete: Bautismo, Confirmación, Eucaristía, Reconciliación, Unción, Orden y Matrimonio.',
        active: true,
        frequency: 'HIGH',
      },
    ],
  ],
} as const;

export const CARD_TYPES: readonly CardType[] = ['FACT', 'QUIZ', 'QUOTE', 'HISTORY', 'HUMOR'];
export const FREQUENCIES: readonly Frequency[] = ['LOW', 'MEDIUM', 'HIGH'];

const TYPE_PREFIX: Record<CardType, string> = {
  FACT: 'A',
  HISTORY: 'H',
  QUOTE: 'Q',
  QUIZ: 'Z',
  HUMOR: 'X',
};

// ── Validation ───────────────────────────────────────────────────────────

// CardDraft: lo que el importador acepta. refCode opcional — si no viene,
// se asigna en el momento del import con assignUniqueRefCode().
export type CardDraft = Omit<Card, 'id' | 'refCode'> & { refCode?: string };

export interface ValidationOk {
  ok: true;
  card: CardDraft;
}

export interface ValidationFail {
  ok: false;
  errors: string[];
}

export type ValidationResult = ValidationOk | ValidationFail;

export const REF_CODE_RE = /^[AHQZX][0-9]{2,3}$/;

export function validateCardInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, errors: ['No es un objeto'] };
  }
  const raw = input as Record<string, unknown>;

  // type
  const type = raw.type;
  if (typeof type !== 'string') {
    errors.push('`type` faltante o no es string');
  } else if (!CARD_TYPES.includes(type as CardType)) {
    errors.push(`\`type\` inválido: "${type}" (usa ${CARD_TYPES.join(', ')})`);
  }

  // title
  if (typeof raw.title !== 'string' || raw.title.trim() === '') {
    errors.push('`title` faltante o vacío');
  } else if (raw.title.length > 80) {
    errors.push('`title` excede 80 caracteres');
  }

  // content
  if (typeof raw.content !== 'string' || raw.content.trim() === '') {
    errors.push('`content` faltante o vacío');
  } else if (raw.content.length > 280) {
    errors.push('`content` excede 280 caracteres');
  }

  // answer
  if (typeof raw.answer !== 'string') {
    errors.push('`answer` debe ser string (usa "" si no aplica)');
  } else {
    if (raw.answer.length > 400) errors.push('`answer` excede 400 caracteres');
    if (type === 'QUIZ' && raw.answer.trim() === '') {
      errors.push('QUIZ requiere `answer` no vacío');
    }
  }

  // refCode (opcional)
  let refCode: string | undefined;
  if (raw.refCode !== undefined) {
    if (typeof raw.refCode !== 'string') {
      errors.push('`refCode` debe ser string si se incluye');
    } else if (!REF_CODE_RE.test(raw.refCode)) {
      errors.push(`\`refCode\` inválido: "${raw.refCode}" (formato esperado: A##, H##, Q##, Z##, X## con 2-3 dígitos)`);
    } else if (typeof type === 'string' && CARD_TYPES.includes(type as CardType)) {
      const expected = TYPE_PREFIX[type as CardType];
      if (raw.refCode[0] !== expected) {
        errors.push(
          `prefijo de \`refCode\` no coincide con \`type\`: ${type} esperaba "${expected}", recibió "${raw.refCode[0]}"`
        );
      } else {
        refCode = raw.refCode;
      }
    } else {
      refCode = raw.refCode as string;
    }
  }

  // active
  if (typeof raw.active !== 'boolean') {
    errors.push('`active` debe ser boolean');
  }

  // frequency
  if (typeof raw.frequency !== 'string') {
    errors.push('`frequency` faltante');
  } else if (!FREQUENCIES.includes(raw.frequency as Frequency)) {
    errors.push(`\`frequency\` inválido: "${raw.frequency}" (usa ${FREQUENCIES.join(', ')})`);
  }

  // propiedades extra
  const allowed = new Set(['type', 'title', 'content', 'answer', 'refCode', 'active', 'frequency']);
  const extras = Object.keys(raw).filter((k) => !allowed.has(k));
  if (extras.length > 0) {
    errors.push(`propiedades no permitidas: ${extras.join(', ')}`);
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    card: {
      type: raw.type as CardType,
      title: (raw.title as string).trim(),
      content: (raw.content as string).trim(),
      answer: (raw.answer as string).trim(),
      ...(refCode ? { refCode } : {}),
      active: raw.active as boolean,
      frequency: raw.frequency as Frequency,
    },
  };
}

// ── Generación de refCode únicos ─────────────────────────────────────────
// Encuentra el siguiente refCode libre para un tipo dado, evitando
// colisiones tanto con la DB como con los recién asignados en la tanda.
export function assignUniqueRefCode(type: CardType, taken: Set<string>): string {
  const prefix = TYPE_PREFIX[type];
  // Primero 2 dígitos (01-99), luego 3 dígitos (100-999)
  for (let n = 1; n <= 999; n++) {
    const padded = n < 100 ? String(n).padStart(2, '0') : String(n);
    const candidate = `${prefix}${padded}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`Sin espacios libres para refCode con prefijo ${prefix}`);
}

// ── Item-level result (con índice y refCode si parseó algo) ──────────────
export interface ParsedItem {
  index: number;
  refCode?: string;
  title?: string;
  result: ValidationResult;
}

export function parseImportPayload(text: string): {
  parseError?: string;
  items: ParsedItem[];
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return {
      parseError: err instanceof Error ? err.message : 'JSON inválido',
      items: [],
    };
  }

  const rawItems = Array.isArray(parsed) ? parsed : [parsed];
  const items: ParsedItem[] = rawItems.map((raw, i) => {
    const result = validateCardInput(raw);
    const refCode =
      raw && typeof raw === 'object' && 'refCode' in raw && typeof (raw as { refCode: unknown }).refCode === 'string'
        ? (raw as { refCode: string }).refCode
        : undefined;
    const title =
      raw && typeof raw === 'object' && 'title' in raw && typeof (raw as { title: unknown }).title === 'string'
        ? (raw as { title: string }).title
        : undefined;
    return { index: i, refCode, title, result };
  });

  return { items };
}
