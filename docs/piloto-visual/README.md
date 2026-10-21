# Piloto visual

Abrir `index.html` en un navegador para revisar 15 candidatos con sus créditos. Las imágenes están guardadas localmente; la galería no depende de enlaces externos para mostrarlas.

## Estado y alcance

Selección editorial inicial, sin importar a Firestore ni cambiar la pantalla publicada. `manifest.json` conserva la ficha de origen, autor, atribución, licencia, descripción original, transformación y fecha de consulta de cada imagen. Las licencias indicadas corresponden a las imágenes, no al código del proyecto. Conservar los créditos y cumplir las condiciones de cada archivo al reutilizarlo; las adaptaciones de imágenes CC BY-SA deben respetar su licencia.

## Revisión antes de publicación

- Confirmar que la imagen representa exactamente el tema, con encuadre reconocible para las niñas.
- Ajustar el texto alternativo al contenido visible y el pie a la intención pedagógica.
- Revisar legibilidad desde la distancia y en la pantalla real.
- Verificar la ficha original y conservar atribución, enlace de licencia y declaración de cambios al publicar.
- En quizzes, evitar imágenes que revelen la respuesta durante la pregunta.

## Integración propuesta

Añadir un recurso visual opcional al modelo de tarjeta: archivo, texto alternativo, pie, autor, atribución, ficha de origen, licencia y cambios. Mantener compatibles las tarjetas actuales. El administrador debe previsualizar el encuadre y mostrar créditos; el reproductor debe conservar texto legible si falla la imagen.

Para quizzes, separar pregunta, opciones, opción correcta y explicación. Las imágenes del piloto son material de reconocimiento; el efecto invernadero, las escalas y los ciclos requieren diagramas propios con etiquetas en español.

La selección inicial se conserva en esta carpeta; el estado de su integración se detalla a continuación.

## Integración disponible en esta rama

- El administrador permite elegir un `imageId` de la biblioteca en tarjetas que no sean QUIZ. El reproductor muestra imagen, pie, créditos y enlaces de licencia junto al texto; si la imagen falla conserva el texto y muestra un aviso.
- Los quizzes aceptan `quiz: { options, correctIndex, seconds }`: de 2 a 4 opciones, índice desde cero y de 10 a 60 segundos. La explicación se guarda en `answer`; la revelación dura 12 segundos. Sin este objeto siguen funcionando como quiz de texto con 15 segundos de pregunta y 6 de respuesta.
- La importación JSON valida y conserva ambos campos opcionales. `null` permite retirarlos. Las tarjetas existentes no necesitan migración. No se reinterpretan automáticamente las opciones que ya estaban escritas dentro del párrafo.
- `/pilot` demuestra fotografía, ciencia, quiz estructurado y quiz clásico sin leer ni escribir Firestore. La selección de imágenes en esta página solo cambia la demostración.
- Los archivos publicados se sirven desde `public/educational`; los metadatos y textos alternativos están en `src/lib/visual-library.json`. Las etiquetas científicas indican color asignado o composición cuando corresponde.
- Siguen pendientes subida de archivos propios, búsqueda externa, diagramas, revisión de las 2.000 tarjetas y aceptación con una sesión real del administrador tras desplegar.

Validación de la integración: `pnpm exec tsx scripts/test-visual-cards.ts`, `pnpm exec tsc --noEmit`, `pnpm build` y revisión en navegador de `/pilot` (imagen, opciones, revelación y compatibilidad del quiz clásico). Esta validación no acredita escrituras autenticadas en Firestore ni un despliegue.
