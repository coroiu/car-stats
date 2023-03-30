import fetch from "node-fetch";
import { CarModel } from "../../models/car.model";
import { FetchResult, Scraper } from "../../scraper";
import { FuelApiResponse, WaykeApiResponse } from "./response-model"

const WaykeUrl =
  "https://www.wayke.se/api/search";

export class WaykeScraper extends Scraper<CarModel> {
  constructor() {
    super(100);
  }

  protected async fetch(
    pageNumber: number,
    pageSize: number
  ): Promise<FetchResult<CarModel>> {
    const query = `hits=${pageSize}&offset=${pageNumber*pageSize}`;
    const encoded = Buffer.from(query).toString('base64');
    const path = `${WaykeUrl}?filter=${encoded}`;
    const result = await fetch(path);
    const json: WaykeApiResponse = await result.json();

    if (json.response == undefined) {
      console.error(path, json);
      throw new Error('Wayke scraper failed');
    }

    function* data() {
      for (const car of json.response.documentList.documents) {
        yield {
          id: car.id,
          fullName: `${car.title} ${car.shortDescription}`,
          title: car.shortDescription,
          brand: car.manufacturer,
          model: car.modelSeries,

          year: car.modelYear,
          mileage: car.mileage,
          condition: undefined,
          fuel: mapFuelType(car.fuelType),
          price: car.price,

          locationName: car.position.city,
          // facilityName: car.facilityName,
        } as CarModel;
      }
    }

    return {
      totalCount: json.response.documentList.numberOfHits,
      pageSize,
      data,
    };
  }
}

function mapFuelType(fuel: FuelApiResponse): CarModel['fuel'] {
  switch (fuel) {
    case 'Diesel':
    case 'Diesel/E85':
      return 'diesel';
    case 'Bensin':
    case 'Bensin/E85':
    case 'Bensin/Naturgas':
    case 'E85':
    case 'Bensin/E85/Naturgas':
      return 'bensin';
    case 'Laddhybrid':
      return 'laddhybrid';
    case 'El':
      return 'el';
    case 'Elhybrid':
      return 'elhybrid';
    case 'Naturgas':
    case 'Bensin/Diesel':
    case 'LPG':
    case 'Bensin/LPG':
    default:
      return 'other';
  }
}