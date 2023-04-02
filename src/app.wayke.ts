import { Client } from "pg";
import { HedinScraper } from "./scrapers/hedin/hedin.scraper";
import { config } from "./config";
import { CarModel } from "./models/car.model";

import cron from 'node-cron';
import { WaykeScraper } from './scrapers/wayke/wayke.scraper';

const limit = 500000;
// const limit = 300;
const printInterval = 500;
const unknown = "Unknown";

async function run() {
  console.log("Initializing...");
  const waykeScraper = new WaykeScraper();
  // const hedinScraper = new HedinScraper();
  const client = new Client({
    host: config.postgresql.host,
    port: config.postgresql.port,
    user: config.postgresql.username,
    password: config.postgresql.password,
    database: config.postgresql.database,
  });
  await client.connect();

  // let i = 0;
  // for await (const car of hedinScraper.scrape()) {
  //   if (i % printInterval === 0) {
  //     console.log(`Parsing Hedin, processed entries: ${i}`);
  //   }

  //   await insertIntoSQL(client, car);

  //   if (++i > limit) {
  //     break;
  //   }
  // }

  let i = 0;
  for await (const car of waykeScraper.scrape()) {
    if (i % printInterval === 0) {
      console.log(`Parsing Wayke, processed entries: ${i}`);
    }

    // console.log(car);
    await insertIntoSQL(client, car);

    if (++i > limit) {
      break;
    }
  }

  console.log(`Finished! Total entries processed: ${i}`);

  // await client.end();
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
    [
      car.id,
      car.fullName ?? unknown,
      car.title ?? unknown,
      car.brand ?? unknown,
      car.model ?? unknown,
      car.year ?? -1,
      car.mileage ?? -1,
      car.condition ?? unknown,
      car.fuel ?? unknown,
      car.locationName ?? unknown,
      car.facilityName ?? unknown,
    ]
  );

  await client.query(`INSERT INTO price("carId", "price") VALUES($1, $2)`, [
    car.id,
    car.price,
  ]);
}

cron.schedule('0 1 * * *', () => {
  run().catch(console.error);
});

run().catch(console.error);
