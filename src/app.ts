import { TestScraper } from './test.scraper';

console.log("hello world");

const scraper = new TestScraper();

async function run() {
  for await (const row of scraper.scrape()) {
    console.log('Data: ', row);
  }
}

run().catch(console.error);