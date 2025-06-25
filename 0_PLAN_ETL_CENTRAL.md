# 📝 0_PLAN_ETL_CENTRAL.md

---

## 🎯 Objetivo General
Centralizar el procesamiento de datos crudos de Spider y GOSOM, consolidándolos en un "CSV Madre" (conceptual, en memoria/descargable) y generando chunks si es necesario, utilizando una aplicación Next.js/React. Se contempla la futura carga a PostgreSQL.

---

## (FASE 2 BASE DE DATOS)


---
## 🧰 Módulos y Tareas a Desarrollar (Adaptado a Next.js/React)

### 1. **Lógica Central (TypeScript en `src/lib/etl-logic.ts`)**
- [x] ✅ **Consolidación de Datos (`consolidateData`)**
  - [x] ✅ Parsear CSVs de Spider y Gosom (usando PapaParse).
  - [x] ✅ Lógica de merge de datos.
  - [x] ✅ Manejar campos diferentes entre Spider y Gosom, priorizando Gosom en conflictos.
  - [x] ✅ Implementar deduplicación real (basado en `deduplication_keys` de `etl_params.json`).
- [x] ✅ **Generación de Chunks (`generateChunks`)**
  - [x] ✅ Dividir datos consolidados según `chunkSize`.
  - [x] ✅ Preparar cada chunk para descarga como CSV.
  - [x] ✅ Implementar lógica para seleccionar columnas a incluir en los chunks.
  - [x] ✅ Añadir columnas `id_chunk_process` y `fecha_chunk_process` a cada registro dentro de los chunks generados.
- [x] ✅ **Registro de Logs**
  - [x] ✅ Implementado mediante `addLog` prop en `page.tsx` y mostrado en la vista de Logs.

### 2. **Interfaz de Procesamiento (`src/app/page.tsx` y componentes asociados)**
- [x] ✅ **Barra Lateral (Sidebar):**
  - [x] ✅ Menú de navegación principal para cambiar entre vistas (Cargar, Consolidar, etc.).
  - [x] ✅ Grupo de "Configuración" con `Input` para `chunkSize`.
  - [x] ✅ Grupo de "Acciones" con botones para iniciar la consolidación y generación de chunks, y para descargar el CSV Madre.
- [x] ✅ **Área Principal con Vistas Dinámicas:**
  - [x] ✅ **Vista de Carga (`UploadTabContent.tsx`):**
    - [x] ✅ Inputs de carga de archivos separados para Spider y Gosom.
    - [x] ✅ Validación real de campos requeridos (definidos en `upload_validation` de `etl_params.json`).
  - [x] ✅ **Vista de Consolidación (`ConsolidateTabContent.tsx`):**
    - [x] ✅ Muestra datos consolidados reales post-procesamiento en una tabla.
  - [x] ✅ **Vista de Chunking (`ChunkingTabContent.tsx`):**
    - [x] ✅ Interfaz de usuario para seleccionar las columnas deseadas para el chunking.
    - [x] ✅ Muestra lista de chunks reales generados para descarga.
  - [x] ✅ **Vista de Logs (`LogsTabContent.tsx`):**
    - [x] ✅ Muestra logs de la UI y operaciones.
 
### 3. **Configuración y Datos (Client-Side / Conceptual)**
- [x] ✅ `config/etl_params.json`:
    - [x] ✅ `chunk_size_default`, `chunk_size_min`, `chunk_size_max`.
    - [x] ✅ `upload_validation` (campos requeridos para Spider/Gosom).
    - [x] ✅ `deduplication_keys`.
    - [x] ✅ `conflict_resolution_priority_source`.
    - [x] ✅ `column_mapping`.
    - [x] ✅ `postgresql_config_placeholder`.
    - [x] ✅ `log_file_path_conceptual` (aclarando que los logs son en UI para la app cliente).

---

## 📚 Historial y Checklist de Desarrollo
- **Fase 1: Implementación de Lógica Real de ETL (Client-Side)**
  - [x] ✅ Interfaz básica con carga de archivos y validación real de CSVs.
  - [x] ✅ Lógica real de consolidación, deduplicación y chunking.
  - [x] ✅ Interfaz completamente funcional con Next.js/React y ShadCN UI.
  - [x] ✅ Configuración y uso de `etl_params.json` para los parámetros del ETL.
  - [x] ✅ Sistema de logging en la UI.
  - [x] ✅ Interfaz de selección de columnas para el chunking.
  - [x] ✅ Refactorización de UI para mover navegación a la barra lateral.
- **Fase 2: Mejoras y Feedback (Actual)**
  - [ ] Mejorar manejo de errores y feedback al usuario en todas las vistas.
  - [ ] Asegurar que la descarga de CSVs (consolidado y chunks) funcione robustamente con datos reales y diversos.
- **Fase 3: Integración con Backend (Potencial - PostgreSQL)**
  - [ ] Identificar operaciones que se beneficiarían de un backend (ej: procesamiento de archivos muy grandes, persistencia).
  - [ ] Desarrollar Genkit flows para dichas operaciones si es necesario.
  - [ ] Implementar carga a base de datos PostgreSQL (requiere Genkit flow o API de backend, usando `postgresql_config_placeholder` de `etl_params.json`).
- **Fase 4: Automatización (Requeriría Backend/Servicios Cloud)**
 - [ ] Considerar ejecución automática/programada si se migra a una arquitectura con backend.

---

## 🔮 Siguientes Pasos Inmediatos

1.  **Refinar el manejo de estados y errores:**
    - Mostrar mensajes más claros durante los estados de carga.
    - Capturar y mostrar errores de borde de manera más explícita en la UI (por ejemplo, si un archivo CSV está malformado).
2.  **Comenzar la planificación para la Fase 3 (PostgreSQL):**
    - Definir el esquema de la base de datos.
    - Diseñar el Genkit flow necesario para la operación de carga.
---
