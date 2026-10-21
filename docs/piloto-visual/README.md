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

Este piloto no agrega todavía campos al administrador, almacenamiento remoto, búsqueda de imágenes ni nuevos formatos al reproductor.
