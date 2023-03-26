export abstract class Scraper<DataModel> {
  private readonly pageSize = 24;

  async *scrape(): AsyncGenerator<DataModel, void, void> {
    let totalCount = Number.MAX_SAFE_INTEGER;
    let pageSize = this.pageSize;
    let emittedCount = 0;

    while (emittedCount < totalCount) {
      const pageNumber = this.nextPage(emittedCount);
      const fetchResult = await this.fetch(pageNumber, this.pageSize);
      const data = fetchResult.data();
      totalCount = fetchResult.totalCount;
      pageSize = fetchResult.pageSize ?? this.pageSize;
      console.log(`Fetching page ${pageNumber} of ${Math.floor(totalCount/pageNumber)}`);
      for (const row of data) {
        yield row;
        ++emittedCount;
      }
    }
  }

  protected abstract fetch(pageNumber: number, pageSize: number): Promise<FetchResult<DataModel>>;

  private nextPage(emittedCount: number): number {
    return Math.floor(emittedCount / this.pageSize);
  }
}

export interface FetchResult<DataModel> {
  totalCount: number;
  pageSize?: number;
  data: () => Generator<DataModel, void, void>;
}
