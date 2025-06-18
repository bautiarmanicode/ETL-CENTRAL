# ✅ Historial de Tareas Completadas para ETL Central (Data Refinery)

## Versión Inicial (Prototipo Actual)
- **Interfaz de Usuario Básica (Next.js/React/ShadCN):**
  - [x] Creada la estructura de la página principal (`src/app/page.tsx`).
  - [x] Implementada la barra lateral (Sidebar) con control para "Tamaño de Chunk".
  - [x] Implementada el área principal con sistema de Pestañas (`Tabs`).

- **Pestaña: Cargar CSVs:**
  - [x] `UploadTabContent.tsx` creado.
  - [x] Inputs de carga de archivos separados para Spider y Gosom.
  - [x] Simulación de validación de tipo de archivo (solo .csv).
  - [x] Actualización del estado con los archivos seleccionados (simulado).
  - [x] Adición de logs para eventos de carga.

- **Pestaña: Consolidar y Deduplicar:**
  - [x] `ConsolidateTabContent.tsx` creado.
  - [x] Botón para iniciar la consolidación.
  - [x] Simulación de la lógica de consolidación y deduplicación.
    - [x] Utiliza datos de ejemplo (mock data) para mostrar el resultado.
    - [x] Simula la prioridad de Gosom en conflictos.
  - [x] Muestra los datos consolidados (simulados) en un `<pre>` tag.
  - [x] Adición de logs para eventos de consolidación.

- **Pestaña: Chunkear:**
  - [x] `ChunkingTabContent.tsx` creado.
  - [x] Input para definir el tamaño del chunk (sincronizado con la sidebar).
  - [x] Botón para generar chunks.
  - [x] Simulación de la lógica de chunking basada en los datos consolidados (simulados).
  - [x] Muestra una lista de chunks generados (simulados) con opción de descarga (simulada).
  - [x] Adición de logs para eventos de chunking y descarga.

- **Pestaña: Logs:**
  - [x] `LogsTabContent.tsx` creado.
  - [x] Muestra los logs de ejecución acumulados en el estado de la aplicación.
  - [x] Formatea los logs con timestamp y tipo (INFO, ERROR, SUCCESS).

- **Lógica de Estado y Props:**
  - [x] Manejo del estado para archivos, datos consolidados, tamaño de chunk, y logs en `src/app/page.tsx`.
  - [x] Paso de props y callbacks a los componentes de las pestañas.

- **Estilos y Componentes UI:**
  - [x] Uso de componentes ShadCN UI (`Button`, `Input`, `Label`, `Tabs`, `Card`, `Textarea`, `Toast`, etc.).
  - [x] Estructura de layout con `Sidebar` y `SidebarInset` de ShadCN.
  - [x] Tema de colores y fuentes base configurado en `globals.css` y `tailwind.config.ts`.

- **Documentación Inicial:**
  - [x] `README.md` inicial del proyecto.
  - [x] Actualizado `README.md` y creado `0_PLAN_ETL_CENTRAL.md`, `0_prompts/*.md`, `config/etl_params.json` según la nueva especificación.

---
*Este historial se irá actualizando a medida que se completen más tareas.*
