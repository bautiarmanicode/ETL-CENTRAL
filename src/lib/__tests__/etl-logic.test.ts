import { consolidateAndDeduplicate, generateChunks, convertToCSV } from '../etl-logic';
import etlParams from '../../config/etl_params.json';


describe('consolidateAndDeduplicate', () => {
  it('should return an array when consolidating data', () => {
    const spiderDataRows = [
      { id: '1', name: 'Company A', url: 'http://companya.com' },
      { id: '2', name: 'Company B', url: 'http://companyb.com' },
    ];
    const gosomDataRows = [
      { guid: 'a', company_name: 'Company C', website: 'http://companyc.com' },
      { guid: 'b', company_name: 'Company D', website: 'http://companyd.com' },
    ];
    const deduplicationKeys = etlParams.deduplication_keys;
    const prioritySource = etlParams.conflict_resolution_priority_source;
    const columnMapping = etlParams.column_mapping;

    const result = consolidateAndDeduplicate(
      spiderDataRows,
      gosomDataRows,
      deduplicationKeys,
 prioritySource,
      columnMapping
    );

    expect(result).toBeInstanceOf(Array);
  });

  it('should deduplicate records based on link and prioritize Gosom data', () => {
    const spiderDataRows = [
      { 
        titulo: 'Restaurante A (Spider)', 
        direccion: 'Calle 123 (Spider)', 
        telefono: '111-1111 (Spider)', 
        link: 'http://google.com/maps/place/A' 
      },
      { 
        titulo: 'Restaurante B (Spider)', 
        direccion: 'Calle 456 (Spider)', 
        telefono: '222-2222 (Spider)', 
        link: 'http://google.com/maps/place/B' 
      },
      { // Duplicate link with Gosom A, Spider should be discarded/merged with lower priority
        titulo: 'Restaurante A Duplicado (Spider)', 
        direccion: 'Otra Calle (Spider)', 
        telefono: '999-9999 (Spider)', 
        link: 'http://google.com/maps/place/A' 
      },
    ];

    const gosomDataRows = [
      { 
        title: 'Restaurante A (Gosom)', 
        address: 'Calle 123 (Gosom)', 
        phone: '111-1111 (Gosom)', 
        link: 'http://google.com/maps/place/A',
        website: 'http://restaurantea-gosom.com',
        category: 'Italiana'
      },
      { // Unique Gosom record
        title: 'Restaurante C (Gosom)', 
        address: 'Calle 789 (Gosom)', 
        phone: '333-3333 (Gosom)', 
        link: 'http://google.com/maps/place/C',
        website: 'http://restaurantec.com',
        category: 'Mexicana'
      },
    ];

    const deduplicationKeys = etlParams.deduplication_keys; // Should be ['link']
    const prioritySource = etlParams.conflict_resolution_priority_source; // Should be 'Gosom'
    const columnMapping = etlParams.column_mapping;

    const result = consolidateAndDeduplicate(
      spiderDataRows,
      gosomDataRows,
      deduplicationKeys,
      prioritySource,
      columnMapping
    );

    // Expect 3 unique records: Gosom A (prioritized merge), Spider B, Gosom C
    expect(result.length).toBe(3);

    // Find the consolidated record for "Restaurante A"
    const consolidatedA = result.find(r => r.link === 'http://google.com/maps/place/A');
    expect(consolidatedA).toBeDefined();
    
    // Verify that Gosom data was prioritized for common fields and mapped correctly
    expect(consolidatedA?.nombre).toBe('Restaurante A (Gosom)');
    expect(consolidatedA?.direccion).toBe('Calle 123 (Gosom)');
    expect(consolidatedA?.telefono).toBe('111-1111 (Gosom)');
    expect(consolidatedA?.link).toBe('http://google.com/maps/place/A');
    
    // Verify that unique Gosom fields are present
    expect(consolidatedA?.website).toBe('http://restaurantea-gosom.com');
    expect(consolidatedA?.category).toBe('Italiana');

    // Verify Spider B record is present and mapped
    const consolidatedB = result.find(r => r.link === 'http://google.com/maps/place/B');
    expect(consolidatedB).toBeDefined();
    expect(consolidatedB?.nombre).toBe('Restaurante B (Spider)');
    expect(consolidatedB?.direccion).toBe('Calle 456 (Spider)');
    expect(consolidatedB?.telefono).toBe('222-2222 (Spider)');

     // Verify Gosom C record is present and mapped
     const consolidatedC = result.find(r => r.link === 'http://google.com/maps/place/C');
     expect(consolidatedC).toBeDefined();
     expect(consolidatedC?.nombre).toBe('Restaurante C (Gosom)');
     expect(consolidatedC?.direccion).toBe('Calle 789 (Gosom)');
     expect(consolidatedC?.telefono).toBe('333-3333 (Gosom)');
     expect(consolidatedC?.website).toBe('http://restaurantec.com');
     expect(consolidatedC?.category).toBe('Mexicana');
  });

  // Add more test cases here
});

describe('generateChunks', () => {
  const consolidatedData = [
    { id: '1', nombre: 'Item 1', valor: 'A', info: 'Extra 1' },
    { id: '2', nombre: 'Item 2', valor: 'B', info: 'Extra 2' },
    { id: '3', nombre: 'Item 3', valor: 'C', info: 'Extra 3' },
    { id: '4', nombre: 'Item 4', valor: 'D', info: 'Extra 4' },
    { id: '5', nombre: 'Item 5', valor: 'E', info: 'Extra 5' },
    { id: '6', nombre: 'Item 6', valor: 'F', info: 'Extra 6' },
    { id: '7', nombre: 'Item 7', valor: 'G', info: 'Extra 7' },
  ];

  it('should divide consolidated data into chunks of the specified size', () => {
    const chunkSize = 3;
    const selectedColumns = ['nombre', 'valor'];

    const chunks = generateChunks(consolidatedData, chunkSize, selectedColumns);

    // Expect 3 chunks: 3, 3, and 1
    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(3);
    expect(chunks[1].length).toBe(3);
    expect(chunks[2].length).toBe(1);
  });

  it('should add chunking process columns and include only selected columns', () => {
    const chunkSize = 2;
    const selectedColumns = ['nombre', 'valor'];

    const chunks = generateChunks(consolidatedData, chunkSize, selectedColumns);

    expect(chunks.length).toBe(4); // 7 items, chunk size 2 -> 4 chunks (2, 2, 2, 1)

    chunks.forEach(chunk => {
      chunk.forEach(record => {
        // Verify chunking process columns are added
        expect(record).toHaveProperty('id_chunk_process');
        expect(typeof record.id_chunk_process).toBe('string');
        expect(record).toHaveProperty('fecha_chunk_process');
        expect(typeof record.fecha_chunk_process).toBe('string');

        // Verify only selected columns and chunking columns are present
        const expectedColumns = ['nombre', 'valor', 'id_chunk_process', 'fecha_chunk_process'];
        const actualColumns = Object.keys(record);
        expect(actualColumns.sort()).toEqual(expectedColumns.sort());

        // Verify selected columns have values from original data
        expect(record).toHaveProperty('nombre');
        expect(record).toHaveProperty('valor');
        expect(record).not.toHaveProperty('info'); // Ensure non-selected column is excluded
      });
    });
  });

  it('should return an empty array for empty consolidated data', () => {
    const chunkSize = 10;
    const selectedColumns = ['nombre'];
    const chunks = generateChunks([], chunkSize, selectedColumns);
    expect(chunks).toEqual([]);
  });
});


  // Add more test cases here
});