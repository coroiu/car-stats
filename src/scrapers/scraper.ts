export interface Scraper<DataModel> {
  scrape(): AsyncGenerator<DataModel, void, void>;
}