import { HedinScraper } from './scrapers/hedin/hedin.scraper';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { config } from './config';
import { CarModel } from './models/car.model';

const limit = 500000;
const printInterval = 500;
const unknown = 'Unknown';

function convertToPoint(car: CarModel): Point {
  return new Point('car-scrape')
      .stringField('id', car.id)
      .stringField('fullName', car.fullName)
      .stringField('title', car.title ?? unknown)
      .uintField('year', car.year)
      .uintField('mileage', car.mileage)
      .intField('price', car.price)
      .tag('brand', car.brand ?? unknown)
      .tag('model', car.model ?? unknown)
      .tag('condition', car.condition)
      .tag('fuel', car.fuel)
      .tag('locationName', car.locationName)
      .tag('facilityName', car.facilityName ?? unknown);
}

async function run() {
  console.log("Initializing...");
  const hedinScraper = new HedinScraper();
  const client = new InfluxDB({url: config.influxDb.url, token: config.influxDb.token});
  const writeApi = client.getWriteApi(config.influxDb.org, config.influxDb.bucket);
  writeApi.useDefaultTags({ agent: 'car-stats-v1.0' });

  let i = 0;
  for await (const car of hedinScraper.scrape()) {
    if (i % printInterval === 0) {
      console.log(`Parsing Hedin, processed entries: ${i}`);
    }

    const point = convertToPoint(car).tag('source', 'hedin');
    writeApi.writePoint(point)

    if (++i > limit) {
      break;
    }
  }

  console.log(`Finished! Total entries processed: ${i}`);

  await writeApi.close();
}

run().catch(console.error);
