import { HedinScraper } from './scrapers/hedin/hedin.scraper';

async function run() {
  const hedinScraper = new HedinScraper();

  let i = 0;

  for await (const car of hedinScraper.scrape()) {
    console.log(car);

    if (++i > 70) {
      return;
    }
  }
}

run().catch(console.error);
