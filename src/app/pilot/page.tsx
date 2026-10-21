'use client';

import { useEffect, useRef, useState } from 'react';
import CardRenderer from '@/components/CardRenderer';
import { CATEGORIES } from '@/lib/categories';
import type { Card } from '@/lib/types';
import visuals from '@/lib/visual-library.json';

const examples: Card[] = [
  { id: 'pilot-history', type: 'HISTORY', title: 'Cristo Redentor', content: 'El **Cristo Redentor** es una gran estatua situada en la cima del cerro del Corcovado, en Río de Janeiro, Brasil.', answer: '', imageId: 'pilot-01', refCode: 'H01', active: false, frequency: 'MEDIUM' },
  { id: 'pilot-science', type: 'FACT', title: 'Saturno', content: '**Saturno** está rodeado por anillos formados principalmente por fragmentos de hielo.', answer: '', imageId: 'pilot-03', refCode: 'A01', active: false, frequency: 'MEDIUM' },
  { id: 'pilot-quiz', type: 'QUIZ', title: 'Planeta más caliente', content: '¿Cuál es el planeta más **caliente** del Sistema Solar?', answer: 'Venus. Su atmósfera densa retiene el calor mediante un intenso efecto invernadero.', quiz: { options: ['Mercurio', 'Venus', 'Marte'], correctIndex: 1, seconds: 20 }, refCode: 'Z01', active: false, frequency: 'MEDIUM' },
  { id: 'pilot-legacy', type: 'QUIZ', title: 'Quiz de texto', content: '¿Cómo se llama nuestro **satélite natural**?', answer: 'La Luna.', refCode: 'Z02', active: false, frequency: 'MEDIUM' },
];

export default function PilotPage() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [imageId, setImageId] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1920));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const item = examples[index];
  const shown = imageId && item.type !== 'QUIZ' ? { ...item, imageId } : item;
  return <main style={{ padding: 24, maxWidth: 1920, margin: 'auto', color: '#172033' }}>
    <h1 style={{ fontSize: 28 }}>Piloto de tarjetas educativas</h1>
    <p>Demostración local con contenido de ejemplo. No guarda cambios en el catálogo.</p>
    <nav aria-label="Ejemplos" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '20px 0' }}>
      {examples.map((sample, i) => <button key={sample.id} aria-pressed={index === i} onClick={() => { setIndex(i); setAnswer(false); setImageId(null); }} style={{ padding: 12, border: '1px solid #64748b', borderRadius: 8, background: index === i ? '#172033' : '#fff', color: index === i ? '#fff' : '#172033' }}>{sample.title}</button>)}
      {item.type === 'QUIZ' ? <button onClick={() => setAnswer((v) => !v)} style={{ padding: 12 }}>{answer ? 'Ver pregunta' : 'Revelar respuesta'}</button> : <label>Imagen <select aria-label="Imagen del piloto" value={imageId || item.imageId || ''} onChange={(e) => setImageId(e.target.value)}>{visuals.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}</select></label>}
    </nav>
    <div ref={container} style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', position: 'relative', border: '1px solid #cbd5e1' }}>
      <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <CardRenderer item={shown} cat={CATEGORIES[item.type]} progress={0} fontScale={1} paused phaseDurationMs={(item.quiz?.seconds || 15) * 1000} quizState={answer ? 'answer' : 'question'} quizSeconds={item.quiz?.seconds || 15} />
      </div>
    </div>
  </main>;
}
