# 📝 0_PLAN_ETL_CENTRAL.md

---

## 🎯 Objetivo General  
Centralizar el procesamiento de datos crudos de Spider y GOSOM, consolidándolos en un "CSV Madre" (conceptual, en memoria/descargable) y generando chunks si es necesario, utilizando una aplicación Next.js/React.

---

## 🧰 Módulos y Tareas a Desarrollar (en el contexto Next.js/React)

### 1. **Lógica Central (TypeScript en `src/app/(components)/data-refinery/` y `src/app/page.tsx`)**
- [x] 🔗 `consolidar_nuevos` (Simulado): Lógica actual en `ConsolidateTabContent.tsx`.
  - Manejar campos diferentes entre Spider y Gosom (simulado, Gosom tiene prioridad).
- [x] 🪓 `generar_chunks` (Simulado): Lógica actual en `ChunkingTabContent.tsx`.
- [x] 📜 Registro de logs: Implementado mediante `addLog` prop y mostrado en `LogsTabContent.tsx`.

### 2. **Interfaz de Procesamiento (`src/app/page.tsx` y componentes asociados)**
- [x] 🖥️ Sidebar con:  
  - [x] `Input` (ShadCN) para tamaño de chunk (`chunkSize` estado en `page.tsx`).
- [x] 📊 Main Area con pestañas (`Tabs` de ShadCN):  
  - [x] **Cargar CSVs**: `UploadTabContent.tsx` con `Input type="file"` separados para Spider y Gosom.
  - [x] **Consolidar**: `ConsolidateTabContent.tsx` - Carga simulada, merge simulado, muestra datos consolidados (simulados).
  - [x] **Chunkear**: `ChunkingTabContent.tsx` - Usa datos consolidados (simulados), genera chunks (simulados) para descarga.
  - [x] **Logs**: `LogsTabContent.tsx` muestra logs del estado de la aplicación.

### 3. **Configuración y Datos (Client-Side)**
- [ ] 🗂️ `config/etl_params.json` (chunk size por defecto, placeholders para futura config de PostgreSQL).
- [ ] 📂 `/data/raw/spider/` y `/data/raw/gosom/` (Conceptuales: archivos son cargados por el usuario vía navegador).
- [ ] 📂 `/data/consolidated/` (Conceptual: "CSV Madre" es un estado en la aplicación, puede ser descargado).
- [ ] 📂 `/data/chunks/` (Conceptual: archivos generados para descarga).

### 4. **Pruebas & CI/CD (Potencial Futuro)**
- [ ] ✅ Pruebas unitarias/integración para lógica de transformación (usando Jest/React Testing Library).
- [ ] ⚙️ GitHub Actions: pruebas automatizadas.

---

## 📚 Historial de Mejoras (Checklist Estilo GOSOM)  
- [x] **Fase 1: MVP (Actual)**  
  - Consolidación simulada, deduplicación simulada, chunking simulado. Interfaz funcional con Next.js/React.
- [ ] **Fase 2: Lógica de Procesamiento Real / Backend (Genkit)**  
  - Implementar lógica real de parseo CSV, consolidación, deduplicación y chunking (posiblemente con Genkit flows si es intensivo).
  - Carga a base de datos PostgreSQL (requiere Genkit flow o backend).
- [ ] **Fase 3: Automatización**  
  - Ejecución automática (requeriría un backend/servicios cloud).

---

## 🔮 Siguientes Pasos  
1. Validar este `0_PLAN_ETL_CENTRAL.md`.  
2. Implementar `config/etl_params.json`.
3. Refinar la lógica simulada en los componentes React hacia una implementación más robusta, potencialmente utilizando Genkit para operaciones complejas o que requieran acceso a backend.
4. Considerar la integración con un backend real para la persistencia de datos (PostgreSQL) y operaciones más allá del navegador.

---
