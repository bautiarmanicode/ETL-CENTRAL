import { consolidateAndDeduplicate } from '../etl-logic';

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
    const deduplicationKeys = ['name', 'company_name'];
    const prioritySource = 'Gosom';

    const result = consolidateAndDeduplicate(
      spiderDataRows,
      gosomDataRows,
      deduplicationKeys,
      prioritySource
    );

    expect(result).toBeInstanceOf(Array);
  });

  // Add more test cases here
});