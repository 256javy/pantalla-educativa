# Renovación del catálogo

`src/lib/catalogo-visual-v1.json` contiene 30 tarjetas: 15 con imágenes de la biblioteca y 15 quizzes con opciones y explicación. Todas usan las nuevas capacidades y aparecen con la misma frecuencia.

## Procedimiento de producción

1. Entrar con una sesión autorizada en `/admin/catalog`.
2. Preparar el respaldo desde el servidor: incluye todos los documentos de `cards`, sus IDs, campos, marcas de tiempo, proyecto y fecha. No depende de paginación de la tabla.
3. Descargar el JSON y verificar el número de documentos y el hash del contenido (SHA-256 de `{ projectId, documents }` serializado con claves ordenadas recursivamente; las marcas de tiempo usan su representación JSON). Conservar el archivo fuera del repositorio.
4. Marcar el respaldo como verificado e iniciar la sustitución. Una segunda lectura bloquea el proceso si el catálogo cambió desde el respaldo.
5. Las 30 nuevas se preparan ocultas; las anteriores se archivan en lotes de 400 sin modificar sus campos educativos; se conserva su estado previo en `catalogOriginalActive` y se desactivan para que las pantallas con versiones anteriores también dejen de mostrarlas; después se publican las 30 nuevas en un único lote.
6. Comprobar que solo las 30 nuevas son visibles y que los originales siguen archivados. El lector público, el administrador y el exportador excluyen `catalogArchive`.

No se borran documentos: `catalogArchive` los retira del catálogo visible. `catalogRelease` identifica los nuevos. Los documentos archivados siguen bajo las reglas de lectura ya existentes; este archivo no es una medida de privacidad. El proceso requiere evitar ediciones simultáneas durante la operación; verifica antes y después, pero no constituye un bloqueo global de otros clientes.

## Restauración

En `/admin/catalog`, preparar y descargar un respaldo actual y elegir «Restaurar catálogo anterior» para la sustitución correspondiente. Se ocultan las nuevas y se retira la marca de archivo de las originales y se restaura su estado activo previo. Sus IDs y campos se conservan. En caso de fallo de la sustitución, se intenta esta recuperación automáticamente. Si también falla la conexión durante la recuperación, volver a entrar y restaurar la sustitución indicada por sus marcas.

## Pruebas

- `pnpm exec tsx scripts/test-visual-cards.ts`: esquema, compatibilidad y cobertura de las 30 nuevas.
- `pnpm exec tsc --noEmit` y `pnpm build`.
- `pnpm dlx firebase-tools emulators:exec --config scripts/fixtures/catalog-emulator.json --project demo-pantalla-catalog --only firestore 'pnpm exec tsx scripts/test-catalog-maintenance.ts'`.
- Prueba de integración con emulador Firestore aislado (`demo-pantalla-catalog`, puerto 8188): 805 originales, bloqueo de respaldo obsoleto, sustitución, restauración exacta de campos y fallo de permisos en el segundo lote con recuperación.

## Fuentes del contenido

Las fotografías y sus licencias están documentadas en `src/lib/visual-library.json`. Los textos son breves descripciones y preguntas originales sobre los temas representados.

- NASA: [Venus](https://science.nasa.gov/venus/venus-facts/), [Júpiter](https://science.nasa.gov/jupiter/jupiter-facts/), [Saturno](https://science.nasa.gov/saturn/facts/), [Marte](https://science.nasa.gov/mars/facts/), [Luna](https://science.nasa.gov/moon/facts/), [Sol](https://science.nasa.gov/sun/facts/) y [Tierra](https://science.nasa.gov/earth/facts/).
- Nobel Prize: [Marie Curie](https://www.nobelprize.org/prizes/physics/1903/marie-curie/facts/).
- UNESCO: [Monte Fuji](https://whc.unesco.org/en/list/1418/).
- Smithsonian: [Mariposas y metamorfosis](https://naturalhistory.si.edu/education/teaching-resources/life-science/butterflies-and-beyond) y [polinización](https://learninglab.si.edu/cabinet/file/ef5a944b-0daa-4b2a-82cf-aa534c88f0b2/SIYC_PlantsAnimals_Pollination_Nov_Dec97.pdf).
- Las ubicaciones y los edificios se identifican también en las fichas originales de las imágenes enlazadas en la biblioteca.
