export type CardType = 'FACT' | 'QUIZ' | 'QUOTE' | 'HISTORY' | 'HUMOR';
export type Frequency = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Card {
  id: string;
  type: CardType;
  title: string;
  content: string; // soporta marcadores **palabra**
  answer: string;
  refCode: string; // ej 'A20'
  active: boolean;
  frequency: Frequency;
}

export interface Category {
  key: CardType;
  label: string;
  bg: string;
  accent: string;
  accentSoft: string;
  ink: string;
  glyph: string;
}
