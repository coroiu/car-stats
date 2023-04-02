import fetch from "node-fetch";
import { CarModel } from "../../models/car.model";
import { delay } from '../../utils';
import { DimensionResult, DimensionValue, FetchResult, MultiDimensionScraper } from '../multi-dimension-scraper';
import { FuelApiResponse, WaykeApiResponse } from "./response-model"

const WaykeUrl =
  "https://www.wayke.se/api/search";

export class WaykeScraper extends MultiDimensionScraper<CarModel> {
  constructor() {
    super(100);
  }

  protected async fetchDimensions(): Promise<DimensionResult> {
    const result = await fetch(WaykeUrl);
    const json: WaykeApiResponse = await result.json();

    const modelSeriesFacet = json.response.facets.find((facet) => facet.id === 'modelSeries');
    const colorFacet = json.response.facets.find((facet) => facet.id === 'color');

    if (modelSeriesFacet === undefined || colorFacet === undefined) {
      throw new Error('Failed to get wayke facets');
    }

    return {
      dimensions: [
        { name: 'modelSeries', values: modelSeriesFacet.filters.map(f => encodeURIComponent(f.displayName)) },
        { name: 'color', values: colorFacet.filters.map(f => encodeURIComponent(f.displayName)) }
      ]
    };
  }

  protected async fetch(
    pageNumber: number,
    pageSize: number,
    dimensionValues: DimensionValue[],
  ): Promise<FetchResult<CarModel>> {
    let query = `hits=${pageSize}&offset=${pageNumber*pageSize}`;
    for (const dimension of dimensionValues) {
      query += `&${dimension.name}=${dimension.value}`;
    }

    // console.log('fetching: ', query);

    const encoded = Buffer.from(query).toString('base64');
    const path = `${WaykeUrl}?filter=${encoded}`;

    let result;
    for (let retries = 20; retries !== 0; --retries) {
      result = await fetch(path);
      if (result.status === 429) {
        console.log('Wayke 429 Too many requests, cooling off...');
        await delay(5000);
        console.log('Wayke 429 retrying');
      }
    }

    if (result === undefined) {
      console.error(path);
      throw new Error('Wayke scraper failed: result undefined.');
    }

    if (result.status > 299) {
      console.error(path, result, await result.text());
      throw new Error('Wayke scraper failed');
    }

    const json: WaykeApiResponse = await result.json();
    if (json.response == undefined) {
      console.error(path, result, json);
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

          locationName: car.position?.city,
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