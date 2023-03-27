import { Client } from 'pg';
import { HedinScraper } from './scrapers/hedin/hedin.scraper';
import { config } from './config';
import { CarModel } from './models/car.model';

const limit = 500000;
// const limit = 20;
const printInterval = 500;
const unknown = 'Unknown';

async function run() {
  console.log("Initializing...");
  const hedinScraper = new HedinScraper();
  const client = new Client({ host: config.postgresql.host, port: config.postgresql.port, user: config.postgresql.username, password: config.postgresql.password, database: config.postgresql.database });
  await client.connect();

  let i = 0;
  for await (const car of hedinScraper.scrape()) {
    if (i % printInterval === 0) {
      console.log(`Parsing Hedin, processed entries: ${i}`);
    }

    await insertIntoSQL(client, car);

    if (++i > limit) {
      break;
    }
  }

  console.log(`Finished! Total entries processed: ${i}`);

  await client.end();
}

async function insertIntoSQL(client: Client, car: CarModel): Promise<void> {
  await client.query(
    `INSERT INTO car(
        "id",
        "fullName",
        "title",
        "brand",
        "model",
        "year",
        "mileage",
        "condition",
        "fuel",
        "locationName",
        "facilityName"
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING`,
      [car.id, car.fullName, car.title ?? unknown, car.brand ?? unknown, car.model ?? unknown, car.year, car.mileage, car.condition,
      car.fuel, car.locationName ?? unknown, car.facilityName ?? unknown]);
  
  await client.query(
    `INSERT INTO price("carId", "price") VALUES($1, $2)`,
    [car.id, car.price]
  )
}

run().catch(console.error);
