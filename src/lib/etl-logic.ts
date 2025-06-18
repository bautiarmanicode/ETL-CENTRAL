
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
  prioritySource: string
): ConsolidatedData {
  
  const spiderRecords = spiderDataRows.map((row, index) => ({
    ...row,
    _temp_id: `s_${index}`, // Temporal unique ID for processing
    source: 'Spider', // Add source information
  }));
  const gosomRecords = gosomDataRows.map((row, index) => ({
    ...row,
    _temp_id: `g_${index}`,
    source: 'Gosom',
  }));

  const allRecords = [...spiderRecords, ...gosomRecords];
  const processedRecords: Map<string, Record<string, string>> = new Map();

  allRecords.forEach(currentRecord => {
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
 * @returns Array de chunks de datos.
 */
export function generateChunks(
  consolidatedData: ConsolidatedData,
  chunkSize: number
): DataChunk[] {
  if (!consolidatedData || consolidatedData.length === 0 || chunkSize <= 0) {
    return [];
  }
  const chunks: DataChunk[] = [];
  for (let i = 0; i < consolidatedData.length; i += chunkSize) {
    chunks.push(consolidatedData.slice(i, i + chunkSize));
  }
  return chunks;
}
