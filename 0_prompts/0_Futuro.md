# 🚀 Ideas Futuras para ETL Central (Data Refinery)

- **Integración con PostgreSQL:**
  - Desarrollar un Genkit flow o un endpoint de API para cargar el CSV Madre consolidado o los chunks individuales a una tabla en PostgreSQL.
  - Configurar credenciales de base de datos de forma segura.
  - Opción en la UI para iniciar la carga a la base de datos.

- **Automatización de Ejecuciones:**
  - (Requeriría un backend/servicios en la nube) Detectar automáticamente nuevos archivos CSV en una ubicación designada (ej: Google Cloud Storage bucket).
  - Ejecutar el pipeline de consolidación y chunking de forma programada o por triggers.
  - Notificaciones sobre la finalización o errores del proceso.

- **Mejoras en la Deduplicación:**
  - Implementar algoritmos de deduplicación más avanzados (ej: fuzzy matching para nombres de empresas, normalización de direcciones).
  - Permitir al usuario configurar los campos clave para la deduplicación y las reglas de resolución de conflictos.

- **Validación de Datos Avanzada:**
  - Validar tipos de datos por columna, rangos, formatos específicos (ej: email, teléfono).
  - Generar un reporte de calidad de datos después de la carga y consolidación.
  - Interfaz para corregir o descartar registros inválidos.

- **Mapeo de Campos Flexible:**
  - Si los CSVs de Spider y Gosom cambian sus esquemas frecuentemente, permitir al usuario mapear columnas de los archivos de entrada a las columnas esperadas del CSV Madre.

- **Interfaz de Usuario Mejorada:**
  - Previsualización interactiva de los datos en cada etapa (carga, consolidación, chunking).
  - Estadísticas y gráficos sobre los datos procesados (ej: número de duplicados encontrados, distribución de leads por chunk).
  - Soporte para archivos más grandes mediante procesamiento en streaming o workers (si se migra a un backend más potente).

- **Historial y Versionado:**
  - Mantener un historial de las ejecuciones del ETL.
  - Permitir revertir a una versión anterior del CSV Madre.

- **Más Fuentes de Datos:**
  - Extender la capacidad para integrar datos de otras fuentes además de Spider y Gosom.

- **Exportación en Diferentes Formatos:**
  - Permitir la descarga de datos en formatos como Excel, JSON, además de CSV.

- **Control de Acceso y Roles:**
  - (Si se convierte en una herramienta multiusuario) Implementar autenticación y roles para restringir el acceso a ciertas funcionalidades.
