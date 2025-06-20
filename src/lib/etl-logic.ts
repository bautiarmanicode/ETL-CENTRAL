
import type { ConsolidatedData, DataChunk } from '@/app/(components)/data-refinery/types';
import Papa from 'papaparse';

/**
 * Consolida y deduplica datos de dos fuentes (Spider y Gosom).
 * @param spiderDataRows Array de registros de Spider.
 * @param gosomDataRows Array de registros de Gosom.
 * @param deduplicationKeys Array de nombres de campos para usar en la deduplicación.
 * @param prioritySource String que indica la fuente prioritaria ('Spider' o 'Gosom').
 * @returns Array de registros consolidados y deduplicados.
 */
export function consolidateAndDeduplicate(
  spiderDataRows: Record<string, string>[],
  gosomDataRows: Record<string, string>[],
 deduplicationKeys: string[],
  prioritySource: string,
 columnMapping: { [source: string]: { [original: string]: string } } // Added columnMapping parameter
): ConsolidatedData {
  
 // Map Spider data to consolidated column names
 const mappedSpiderRecords = spiderDataRows.map((row, index) => {
    const mappedRow: Record<string, string> = {};
 for (const key in row) {
 if (Object.hasOwnProperty.call(row, key)) {
        const consolidatedKey = columnMapping.spider_to_consolidated[key] || key; // Use original key if not in mapping
 mappedRow[consolidatedKey] = row[key];
 }
    }
 return {
 ...mappedRow,
    _temp_id: `s_${index}`, // Temporal unique ID for processing
 source: 'Spider', // Add source information
 };
  });

 // Map Gosom data to consolidated column names
  const mappedGosomRecords = gosomDataRows.map((row, index) => {
    const mappedRow: Record<string, string> = {};
 for (const key in row) {
 if (Object.hasOwnProperty.call(row, key)) {
        const consolidatedKey = columnMapping.gosom_to_consolidated[key] || key; // Use original key if not in mapping
 mappedRow[consolidatedKey] = row[key];
 }
    }
 return {
 ...mappedRow,
    _temp_id: `g_${index}`,
    source: 'Gosom',
  }));

  const allRecords = [...spiderRecords, ...gosomRecords];
  const processedRecords: Map<string, Record<string, string>> = new Map();

  allRecords.forEach(currentRecord => {
    // Use consolidated column names for deduplication keys
    const dedupeKeyValues = deduplicationKeys.map(key => currentRecord[key] || ''); // Fallback to empty string if key is missing
    
    const allDedupeFieldsAreEmpty = dedupeKeyValues.every(val => val === '');
    const dedupeKeyValue = allDedupeFieldsAreEmpty
      ? `temp_id_${currentRecord._temp_id}`
      : dedupeKeyValues.join('|');

    if (processedRecords.has(dedupeKeyValue)) {
      const existingRecord = processedRecords.get(dedupeKeyValue)!;
      let winner: Record<string, string>;
      let loser: Record<string, string>;

      if (currentRecord.source === prioritySource && existingRecord.source !== prioritySource) {
        winner = currentRecord;
        loser = existingRecord;
      } else if (existingRecord.source === prioritySource && currentRecord.source !== prioritySource) {
        winner = existingRecord;
        loser = currentRecord;
      } else if (currentRecord.source === prioritySource && existingRecord.source === prioritySource) {
        winner = currentRecord; 
        loser = existingRecord;
      } else { 
        winner = currentRecord;
        loser = existingRecord;
      }
      
      const mergedRecord = { ...loser, ...winner }; 
      mergedRecord.source = winner.source; 
      
      processedRecords.set(dedupeKeyValue, mergedRecord);
    } else {
      processedRecords.set(dedupeKeyValue, currentRecord);
    }
  });

  let consolidatedList = Array.from(processedRecords.values());

  return consolidatedList.map((record, index) => {
    const { _temp_id, ...finalRecord } = record; 
    return {
      ...finalRecord,
      id: (index + 1).toString(), 
    };
  });
}

/**
 * Convierte un array de objetos (ConsolidatedData o DataChunk) a una cadena CSV.
 * @param data Array de objetos a convertir.
 * @returns Cadena de texto en formato CSV.
 */
export function convertToCSV(data: ConsolidatedData | DataChunk): string {
  if (!data || data.length === 0) {
    return "";
  }
  return Papa.unparse(data);
}

/**
 * Genera chunks de datos a partir de un array de datos consolidados.
 * @param consolidatedData Array de datos consolidados.
 * @param chunkSize Número de registros por chunk.
 * @param selectedColumns Array de nombres de columnas a incluir en los chunks.
 * @returns Array de chunks de datos.
 */
export function generateChunks(
  consolidatedData: ConsolidatedData,
  chunkSize: number,
  selectedColumns: string[]
): DataChunk[] {
  if (!consolidatedData || consolidatedData.length === 0 || chunkSize <= 0) {
    return [];
  }

  const chunkProcessId = Date.now().toString(); // Simple ID for the chunking process
  const chunkDate = new Date().toISOString(); // ISO string for current date/time

  const processedChunks: DataChunk[] = [];

  for (let i = 0; i < consolidatedData.length; i += chunkSize) {
    const chunkSlice = consolidatedData.slice(i, i + chunkSize);
    const processedChunk = chunkSlice.map(record => {
      const newRecord: Record<string, string> = {};
      selectedColumns.forEach(col => {
        if (record[col] !== undefined) {
          newRecord[col] = record[col];
        }
      });
      // Add chunking process info
      newRecord['id_chunk_process'] = chunkProcessId;
      newRecord['fecha_chunk_process'] = chunkDate;

      return newRecord;
    });
    processedChunks.push(processedChunk);
  }

  // Update convertToCSV to handle selected columns and the new chunking info columns
  // We will need to modify convertToCSV next to use a columns option from PapaParse
  // For now, generateChunks returns data with only selected columns + new info

  return processedChunks;
}
