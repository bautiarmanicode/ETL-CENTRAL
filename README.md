# 🚀✨ ETL Central - Especificación de la Interfaz y Lógica de Procesamiento 📊🤖

---

## 🎯 Objetivo General  
Centralizar el procesamiento de datos crudos de **Spider** y **GOSOM**, consolidándolos en un CSV Madre (conceptual, client-side) y generando chunks si es necesario. Este módulo es implementado en Next.js con React y ShadCN UI.

---

## 📐 Layout General  
La interfaz se divide en tres áreas principales:  

- 🖥️ **Barra Lateral (Sidebar):**  
  - Configuración de parámetros (tamaño de chunk).  

- 📊 **Área Principal (Main Area):**  
  - Pestañas para:  
    - **Cargar CSVs**: Subir archivos desde Spider y Gosom.  
    - **Consolidar**: Merge con CSV Madre (simulado) + deduplicación (simulada).  
    - **Chunkear**: Dividir CSV Madre (simulado) en chunks.  
    - **Logs**: Visualización de registros de ejecución.  

---

## 🏃‍♀️ Cómo Usar la Aplicación

Para ejecutar la aplicación localmente, sigue estos pasos:

1.  Asegúrate de tener [Node.js](https://nodejs.org/en/) instalado en tu máquina.
2.  Abre la terminal o línea de comandos.
3.  Navega hasta el directorio raíz de este proyecto donde se encuentra el archivo `package.json`.
4.  Instala las dependencias del proyecto ejecutando uno de los siguientes comandos (dependiendo del gestor de paquetes que prefieras):



## 🛠️ Componentes y Funcionalidades Detalladas (Implementado con Next.js/React)

### 1. **Carga de CSVs Crudos**  
- **Formato Esperado (Validación simulada):**  
  - **Spider:** `nombre`, `dirección`, `teléfono`.  
  - **Gosom:** `nombre`, `website`, `email`.  
- **UI (Conceptual, implementado con ShadCN `Input type="file"`):**  
  La aplicación (`src/app/page.tsx`) incluye componentes para cargar archivos CSV de Spider y Gosom, con validación simulada del tipo de archivo.

### 2. **Consolidación y Deduplicación**  
- **Lógica (Simulada en cliente):**  
  - Unir nuevos CSVs con datos consolidados en memoria.  
  - Deduplicar usando `link` y `title` (simulado). Los datos de Gosom tienen prioridad en caso de conflicto.

### 3. **Chunking (Opcional)**  
- **Parámetros:** Tamaño de chunk (configurable en la UI).  
- **Salida:** Descarga de archivos CSV por chunk.

---

## 📂 Ubicaciones de Archivos Clave (Conceptuales para el Flujo de Datos)
Dado que esta es una aplicación web frontend, los "archivos" y "directorios de datos" son manejados de la siguiente manera:
- **CSVs Crudos de Spider/Gosom:** Cargados a través del navegador, procesados en memoria.
- **CSV Madre (Consolidado):** Estado en memoria dentro de la aplicación React. Puede ser descargado.
- **Chunks Generados:** Generados en memoria y disponibles para descarga individual.
- **Logs de Ejecución:** Mantenidos en el estado de la aplicación y mostrados en la pestaña "Logs".

---

## 📌 **Ejemplo de Uso**  
1. En la pestaña "Cargar CSVs", subir `leads_spider.csv` y `leads_gosom.csv`.  
2. Ir a la pestaña "Consolidar" y hacer clic en "Consolidar" para mergear y deduplicar (simulado).  
3. Si es necesario, ir a la pestaña "Chunkear", ajustar el tamaño de chunk, y generar chunks para descarga.  
4. Revisar la pestaña "Logs" para ver el historial de operaciones.

---

## 📚 Documentación Adicional  
- 🚀 **[Ideas Futuras](0_prompts/0_Futuro.md):**  
  - Integración con backend (ej. PostgreSQL usando Genkit).  
  - Automatización de ejecuciones (requeriría un backend).  
- 📋 **[Tareas Pendientes](0_prompts/1_Mejoras.md):**  
  - Mejorar la lógica real de deduplicación y chunking (actualmente simulada).  
- ✅ **[Historial de Tareas Completadas](0_prompts/2_Historial.md):**  
  - Registrar tareas resueltas.  

---

## 🧠 Reflexión Final  
- **ETL Central (Data Refinery) es el cerebro del flujo del lado del cliente:** Spider y GOSOM son fuentes de datos CSVs crudos.  
- **Futuro en Backend:** Funcionalidades como la persistencia en PostgreSQL o la automatización requerirán un componente de backend.  
- **Tecnologías:** Next.js, React, TypeScript, ShadCN UI, Tailwind CSS.  

---

*¡Gracias por leer esta documentación!  
ETL Central (Data Refinery) está diseñado para ser **modular y escalable dentro del paradigma frontend actual**, con potencial de expansión a backend.* 🌟  
