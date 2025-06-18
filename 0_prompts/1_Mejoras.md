# 📋 Tareas Pendientes / Mejoras para ETL Central (Data Refinery)

## Prioridad Alta
- **Implementar Lógica Real de Parseo CSV:**
  - Reemplazar la simulación actual con una librería robusta de parseo CSV (ej. PapaParse en el cliente, o un flow de Genkit si los archivos son grandes o el procesamiento es complejo).
  - Manejar correctamente delimitadores, comillas, saltos de línea.
  - Extraer encabezados y filas.

- **Implementar Lógica Real de Consolidación:**
  - Basado en los datos parseados, realizar el merge real de los datos de Spider y Gosom.
  - Aplicar la lógica de prioridad para Gosom en caso de campos conflictivos.

- **Implementar Lógica Real de Deduplicación:**
  - Implementar la deduplicación basada en los campos `link` y `title` (o los que se definan).
  - Considerar la normalización de datos (ej: a minúsculas, quitar espacios extra) antes de comparar para mejorar la precisión.

- **Implementar Lógica Real de Chunking:**
  - Dividir el DataFrame consolidado y deduplicado en chunks del tamaño especificado por el usuario.
  - Asegurar que cada chunk se pueda descargar correctamente como un CSV.

- **Manejo de Errores Robusto:**
  - Mejorar el manejo de errores durante el parseo, consolidación, y chunking.
  - Proveer mensajes de error claros al usuario y en los logs.

## Prioridad Media
- **Refinar UI/UX para Flujo de Datos:**
  - Mostrar previsualizaciones de datos más informativas después de cada paso.
  - Indicar claramente el número de registros cargados, consolidados, duplicados eliminados, y generados en chunks.
  - Mejorar la retroalimentación visual durante operaciones largas (ej: spinners, barras de progreso si es posible en cliente).

- **Configuración desde `etl_params.json`:**
  - Leer valores por defecto (ej: `chunk_size_default`) del archivo `config/etl_params.json` si existe.
  - Esto es más relevante si se evoluciona a tener un componente backend o Genkit flows.

- **Pruebas Unitarias:**
  - Escribir pruebas unitarias para las funciones de parseo, consolidación, deduplicación y chunking una vez que la lógica real esté implementada.

## Prioridad Baja / Consideraciones Futuras
- **Optimización de Rendimiento para Archivos Grandes (Cliente):**
  - Investigar el uso de Web Workers para procesar CSVs grandes en segundo plano sin bloquear el hilo principal, si el procesamiento sigue siendo del lado del cliente.

- **Internacionalización (i18n):**
  - Si la herramienta necesita soportar múltiples idiomas, planificar la estructura para la internacionalización de textos en la UI.

- **Mejoras de Accesibilidad (a11y):**
  - Realizar una auditoría de accesibilidad y aplicar mejoras según sea necesario.
