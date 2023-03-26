import { FetchResult, Scraper } from "./scraper";

export class TestScraper extends Scraper<number> {
  protected async fetch(
    pageNumber: number,
    pageSize: number
  ): Promise<FetchResult<number>> {
    console.log("fetch", { pageNumber, pageSize });
    await delay(5000);

    const data = Array.from(
      { length: pageSize },
      (x, i) => pageSize * pageNumber + i
    );

    return {
      totalCount: 100,
      data: function* () {
        for (const row of data) {
          yield row;
        }
      },
    };
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}
