import { Scraper } from './scraper';
import { SingleDimensionScraper } from './single-dimension-scraper';

export abstract class MultiDimensionScraper<DataModel> implements Scraper<DataModel> {
  constructor(private readonly pageSize = 24) {}

  async *scrape(): AsyncGenerator<DataModel, void, void> {
    const combinations = await this.fetchDimensions();
    console.log(combinations);
    // const combinations = allCombinations(dimensions);

    for ( const combination of combinations ) {
      console.log('Processing dimension set:', combination);

      const parentPageSize = this.pageSize;
      const parentFetchImplementation = (pageNumber: number, pageSize: number) => this.fetch(pageNumber, pageSize, combination);
      const subScraper = new class DimensionValueScraper extends SingleDimensionScraper<DataModel> {
        constructor() {
          super(parentPageSize);
        }

        protected fetch(pageNumber: number, pageSize: number): Promise<FetchResult<DataModel>> {
          return parentFetchImplementation(pageNumber, pageSize);
        }
      };

      try {
        const data = subScraper.scrape();
        for await (const row of data) {
          yield row;
        }
      } catch (error) {
        console.error('Dimension failed: ', error);
      }
    }
  }

  protected abstract fetchDimensions(): Promise<DimensionValue[][]>;

  protected abstract fetch(
    pageNumber: number,
    pageSize: number,
    dimensionValues: DimensionValue[]
  ): Promise<FetchResult<DataModel>>;
}

export interface DimensionResult {
  dimensions: Dimension[];
}

export interface Dimension {
   name: string; values: string[];
}

export interface DimensionValue {
  name: string; value: string;
}

export interface FetchResult<DataModel> {
  totalCount: number;
  pageSize?: number;
  data: () => Generator<DataModel, void, void>;
}

export function allCombinations(dimensions: Dimension[]): DimensionValue[][] {
  if (dimensions.length === 1) {
    return dimensions[0].values.map(value => [{ name: dimensions[0].name, value }]);
  }

  const sliced = dimensions.slice(1);
  const dimension = dimensions[0];
  
  return dimension.values.flatMap(value => {
    const combinations = allCombinations(sliced);
    return combinations.map((c) => [...c, { name: dimension.name, value, }]);
  });
}

// console.log(
//   allCombinations([
//     { name: 'color', values: ['white', 'red', 'black'] },
//     { name: 'fuel', values: ['bensin', 'diesel', 'laddhybrid'] },
//     { name: 'cost', values: ['10', '100', '1000'] }
//   ])
// );