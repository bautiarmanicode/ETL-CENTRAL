
import type { ConsolidatedData } from '@/app/(components)/data-refinery/types';
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
    
    // If all deduplication keys result in empty strings for this record,
    // use its temporary unique ID as the dedupe key to prevent incorrect merging
    // of unrelated records that happen to lack all deduplication fields.
    const allDedupeFieldsAreEmpty = dedupeKeyValues.every(val => val === '');
    const dedupeKeyValue = allDedupeFieldsAreEmpty
      ? `temp_id_${currentRecord._temp_id}`
      : dedupeKeyValues.join('|');

    if (processedRecords.has(dedupeKeyValue)) {
      const existingRecord = processedRecords.get(dedupeKeyValue)!;
      let winner: Record<string, string>;
      let loser: Record<string, string>;

      // Determine winner based on prioritySource
      if (currentRecord.source === prioritySource && existingRecord.source !== prioritySource) {
        winner = currentRecord;
        loser = existingRecord;
      } else if (existingRecord.source === prioritySource && currentRecord.source !== prioritySource) {
        winner = existingRecord;
        loser = currentRecord;
      } else if (currentRecord.source === prioritySource && existingRecord.source === prioritySource) {
        // Both are priority source, current one wins (effectively an update)
        winner = currentRecord; 
        loser = existingRecord;
      } else { 
        // Neither is priority (e.g., both Spider), or prioritySource is not one of them.
        // Let current one win to ensure some form of update/merge if keys were truly identical.
        // Or, could be based on which one has more fields, etc. For now, current wins.
        winner = currentRecord;
        loser = existingRecord;
      }
      
      // Merge fields: winner's fields take precedence
      const mergedRecord = { ...loser, ...winner }; 
      // Ensure the source reflects the winner, or a combined status if needed.
      // For now, winner's source prevails.
      mergedRecord.source = winner.source; 
      
      processedRecords.set(dedupeKeyValue, mergedRecord);
    } else {
      // Not a duplicate by key, add it to processed records
      processedRecords.set(dedupeKeyValue, currentRecord);
    }
  });

  let consolidatedList = Array.from(processedRecords.values());

  // Assign final unique 'id' and remove temporary '_temp_id'
  return consolidatedList.map((record, index) => {
    const { _temp_id, ...finalRecord } = record; // Destructure to remove _temp_id
    return {
      ...finalRecord,
      id: (index + 1).toString(), // Add final 'id' field
    };
  });
}

/**
 * Convierte un array de objetos (ConsolidatedData) a una cadena CSV.
 * @param data Array de objetos a convertir.
 * @returns Cadena de texto en formato CSV.
 */
export function convertToCSV(data: ConsolidatedData): string {
  if (!data || data.length === 0) {
    return "";
  }
  // Papa.unparse will infer headers from the keys of the first object.
  return Papa.unparse(data);
}
