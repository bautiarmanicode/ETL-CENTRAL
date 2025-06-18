# 🚀 Ideas Futuras para ETL Central (Data Refinery)

- **Integración con PostgreSQL:**
  - La Fase 2 del roadmap incluye la integración con PostgreSQL para reemplazar el CSV Madre como almacenamiento principal.
  - El servicio intermedio (ETL Central) se encargará de cargar los datos del CSV Madre (o directamente de los CSVs crudos procesados) en la base de datos.
  - Cuando se diseñe el esquema de la tabla, se analizarán las columnas de los CSVs de Guía Cores y GOSOM para identificar campos comunes y mapearlos a la tabla de destino.
  - Configurar credenciales de base de datos de forma segura.
  - Opción en la UI para iniciar la carga a la base de datos.

- **Automatización de Ejecuciones:**
  - (Requeriría un backend/servicios en la nube) Detectar automáticamente nuevos archivos CSV en una ubicación designada (ej: Google Cloud Storage bucket).
  - Ejecutar el pipeline del ETL Central (deduplicación, consolidación, chunkeo y carga a DB en el futuro) de forma programada o por triggers.
  - Notificaciones sobre la finalización o errores del proceso.

- **Mejoras en la Deduplicación:**
  - La lógica de deduplicación actual se basa en link y title.
  - Implementar algoritmos de deduplicación más avanzados (ej: fuzzy matching para nombres de empresas, normalización de direcciones).
  - Permitir al usuario configurar los campos clave para la deduplicación y las reglas de resolución de conflictos.
  - La definición de llaves primarias únicas para empresas (Nombre + Dirección, URL, Link de Google Maps) y contactos (Email + Nombre, Teléfono + Nombre) será crucial para la deduplicación y consolidación futura en la base de datos.

- **Validación de Datos Avanzada:**
  - Validar tipos de datos por columna, rangos, formatos específicos (ej: email, teléfono).
  - Generar un reporte de calidad de datos después de la carga y consolidación.
  - Interfaz para corregir o descartar registros inválidos.
  - Esto puede implementarse como parte del servicio intermedio del ETL Central.

- **Mapeo de Campos Flexible:**
  - Dado que GOSOM y Spider solo se enfocan en generar CSVs crudos sin manipulación de datos, la responsabilidad de mapear columnas y transformar datos recae en el ETL Central.
  - Permitir al usuario mapear columnas de los archivos de entrada a las columnas esperadas del CSV Madre y eventualmente al esquema de la base de datos.

- **Interfaz de Usuario Mejorada:**
  - Previsualización interactiva de los datos en cada etapa (carga, consolidación, chunking).
  - Estadísticas y gráficos sobre los datos procesados (ej: número de duplicados encontrados, distribución de leads por chunk).

- **Historial y Versionado:**
  - Mantener un historial de las ejecuciones del ETL.
  - Permitir revertir a una versión anterior del CSV Madre.

- **Más Fuentes de Datos:**
- **Exportación en Diferentes Formatos:**
  - Permitir la descarga de datos en formatos como Excel, JSON, además de CSV.

- **Control de Acceso y Roles:**
  - (Si se convierte en una herramienta multiusuario) Implementar autenticación y roles para restringir el acceso a ciertas funcionalidades.
