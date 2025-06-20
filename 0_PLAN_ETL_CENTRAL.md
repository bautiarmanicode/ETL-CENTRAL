# 📝 0_PLAN_ETL_CENTRAL.md

---

## 🎯 Objetivo General
Centralizar el procesamiento de datos crudos de Spider y GOSOM, consolidándolos en un "CSV Madre" (conceptual, en memoria/descargable) y generando chunks si es necesario, utilizando una aplicación Next.js/React. Se contempla la futura carga a PostgreSQL.

---

## (FASE 2 BASE DE DATOS)


---
## 🧰 Módulos y Tareas a Desarrollar (Adaptado a Next.js/React)

### 1. **Lógica Central (TypeScript en `src/app/(components)/data-refinery/`, `src/lib/etl-logic.ts` o Genkit Flows)**
- [ ] **Consolidación de Datos (`consolidateData`)**
  - [ ] Parsear CSVs de Spider y Gosom (usar una librería como PapaParse).
  - [ ] Lógica de merge de datos.
  - [ ] Manejar campos diferentes entre Spider y Gosom (ej: `url` vs `website`), priorizando Gosom en conflictos según `etl_params.json`.
  - [ ] Implementar deduplicación real (basado en `deduplication_keys` de `etl_params.json`).
 - _Actual: Simulado en `ConsolidateTabContent.tsx`._
- [ ] **Generación de Chunks (`generateChunks`)**
  - [ ] Dividir datos consolidados según `chunkSize`.
  - [ ] Preparar cada chunk para descarga como CSV.
  - [ ] Implementar lógica para seleccionar columnas a incluir en los chunks.
  - [ ] Añadir columnas `id_chunk` y `fecha_chunk` a cada registro dentro de los chunks generados.
- [ ] **Registro de Logs**
  - [x] Implementado mediante `addLog` prop en `page.tsx` y mostrado en `LogsTabContent.tsx`.
  - _Futuro: Si se usa backend/Genkit, considerar logging estructurado allí._
### 2. **Interfaz de Procesamiento (`src/app/page.tsx` y componentes asociados en `src/app/(components)/data-refinery/`)**
- [x] **Sidebar:**
  - [x] `Input` (ShadCN) para `chunkSize` (controlado en `page.tsx`, con min/max de `etl_params.json`).
- [x] ✅ **Área Principal con Pestañas (ShadCN `Tabs`):**
  - [x] ✅ **Cargar CSVs (`UploadTabContent.tsx`):**
    - [x] ✅ Inputs de carga de archivos separados para Spider y Gosom.
    - [ ] Validación real de campos requeridos (definidos en `upload_validation` de `etl_params.json`) al cargar. _Actual: Validación de tipo .csv simulada._
  - [x] ✅ **Consolidar (`ConsolidateTabContent.tsx`):**
    - [x] ✅ Botón para iniciar la consolidación.✅ Mostrar datos consolidados reales (post-procesamiento).✅ Permitir descarga del CSV Madre consolidado.
  - [x] ✅ **Chunkear (`ChunkingTabContent.tsx`):**
    - [ ] Reemplazar la vista previa básica con `JSON.stringify` por una tabla interactiva para visualizar los datos consolidados.
    - [x] ✅ Botón para generar chunks.✅ Usar datos consolidados reales.
    - [x] ✅ Mostrar lista de chunks reales generados para descarga. _Actual: Simulado._
    - [ ] Añadir interfaz de usuario para seleccionar las columnas deseadas para el chunking.
  - [x] ✅ **Logs (`LogsTabContent.tsx`):**
    - [x] ✅ Muestra logs de la UI y operaciones simuladas.
 
### 3. **Configuración y Datos (Client-Side / Conceptual)**
- [x] `config/etl_params.json`:
    - [x] ✅ `chunk_size_default`, `chunk_size_min`, `chunk_size_max`.
    - [x] ✅ `upload_validation` (campos requeridos para Spider/Gosom).
 - [ ] Refinar `upload_validation`, `deduplication_keys` y `conflict_resolution_priority_source` basándose en las columnas reales de los archivos de origen (Spider y Gosom de ejemplo).
    - [x] ✅ `deduplication_keys`.
    - [x] ✅ `conflict_resolution_priority_source`.
    - [x] ✅ `postgresql_config_placeholder`.
    - [x] ✅ `log_file_path_conceptual` (aclarando que los logs son en UI para la app cliente).
- **Archivos de Datos (Manejo en el Navegador):**
  - **CSVs Crudos (Spider/Gosom):** Cargados por el usuario vía `<input type="file">`, procesados en memoria. No se guardan en `data/raw/` en el cliente.
  - **CSV Madre (Consolidado):** Estado en la aplicación React (`consolidatedData` en `page.tsx`), descargable. No se guarda en `data/consolidated/` en el cliente.
  - **Chunks Generados:** Objetos en memoria, descargables individualmente. No se guardan en `data/chunks/` en el cliente.
  - **Logs de Ejecución:** Array en el estado de la app (`logs` en `page.tsx`), mostrados en la UI. No se escribe a `data/logs/etl_central.log` en el cliente.

### 4. **Pruebas & CI/CD (Potencial Futuro)**
- [ ] GitHub Actions: configurar para ejecutar pruebas automatizadas.

---

## 📚 Historial y Checklist de Desarrollo
- **Fase 1: MVP (Actual - Funcionalidad Simulada)**
  - [x] ✅ Interfaz básica con carga de archivos (validación de tipo de archivo).
  - [x] ✅ Consolidación simulada, deduplicación simulada, chunking simulado.
  - [x] ✅ Interfaz completamente funcional con Next.js/React y ShadCN UI.
  - [x] ✅ Configuración y uso básico de `etl_params.json` para `chunkSize`.
  - [x] Implementar Lógica Real de Parseo CSV.
  - [x] Implementar Lógica Real de Consolidación.
  - [x] Implementar Lógica Real de Deduplicación.
  - [x] Implementar Lógica Real de Chunking.
  - [x] ✅ Sistema de logging en la UI.
- **Fase 2: Implementación de Lógica Real de ETL (Client-Side)**
  - [ ] Implementar parseo real de CSV (ej: PapaParse) en `UploadTabContent.tsx` o `src/lib/etl-logic.ts`.
  - [ ] Mejorar manejo de errores y feedback al usuario en todas las pestañas.
  - [ ] Asegurar que la descarga de CSVs (consolidado y chunks) funcione con datos reales.
- **Fase 3: Integración con Backend (Potencial - PostgreSQL)**
  - [ ] Identificar operaciones que se beneficiarían de un backend (ej: procesamiento de archivos muy grandes, persistencia).
  - [ ] Desarrollar Genkit flows para dichas operaciones si es necesario.
  - [ ] Implementar carga a base de datos PostgreSQL (requiere Genkit flow o API de backend, usando `postgresql_config_placeholder` de `etl_params.json`).
- **Fase 4: Automatización (Requeriría Backend/Servicios Cloud)**
 - [ ] Considerar ejecución automática/programada si se migra a una arquitectura con backend.
1. **Validar este `0_PLAN_ETL_CENTRAL.md` actualizado.** (Iteración actual).
2. **Implementar parseo y validación de CSVs en `UploadTabContent.tsx`:**
    - Utilizar una librería como PapaParse para leer el contenido de los archivos CSV.
    - Leer `upload_validation` de `config/etl_params.json`.
    - Validar que los encabezados requeridos existan en los respectivos archivos.
    - Mostrar errores específicos al usuario en la UI (`toast` y/o mensajes en la Card) si la validación falla.
    - Si la validación es exitosa, almacenar los datos parseados (array de objetos) en el estado (`spiderFileData`, `gosomFileData`) en lugar de solo el objeto `File`.
3. **Implementar la lógica real de consolidación y deduplicación:**
    - Crear/Usar un archivo para la lógica, ej: `src/lib/etl-logic.ts`.
    - Crear funciones como:
        - `function consolidateAndDeduplicate(spiderData: Record<string, string>[], gosomData: Record<string, string>[], deduplicationKeys: string[], prioritySource: string, gosomFields: string[], spiderFields: string[]): ConsolidatedData`
    - Esta función debe:
        - Mapear campos (ej. si Spider usa 'telefono' y Gosom 'teléfono', o 'direccion' vs 'address').
        - Unir los dos conjuntos de datos.
        - Aplicar la lógica de prioridad de `prioritySource` (Gosom) para campos en común si hay conflicto.
        - Deduplicar basado en `deduplicationKeys`.
    - Integrar esta función en `ConsolidateTabContent.tsx`, usando los datos parseados del paso anterior y los parámetros de `etl_params.json`.
    - Actualizar la UI para mostrar los datos consolidados reales y permitir su descarga como CSV.
4. **Implementar la lógica real de chunking:**
    - En `src/lib/etl-logic.ts` (o similar), crear función: `function generateChunks(consolidatedData: ConsolidatedData, chunkSize: number): DataChunk[]`.
    - Integrar en `ChunkingTabContent.tsx`, usando los datos consolidados reales.
    - Asegurar que la descarga de cada chunk funcione correctamente.
5. **Mejorar el feedback visual y manejo de estados (loading, success, error) en todas las pestañas durante estas operaciones.**

---

- **Carga a PostgreSQL: Migrar datos del CSV madre a la base de datos** (requiere Genkit flow o API de backend).


---

