import fetch from "node-fetch";
import { CarModel } from "../../models/car.model";
import { FetchResult, Scraper } from "../../scraper";
import { HedinApiResponse } from './response-model';

const HedinUrl =
  "https://www.hedinbil.se/apicommerce/HedinBil/SearchCarsWithFilters";

export class HedinScraper extends Scraper<CarModel> {
  constructor() {
    super(24);
  }

  protected async fetch(
    pageNumber: number,
    pageSize: number
  ): Promise<FetchResult<CarModel>> {
    const result = await fetch(
      `${HedinUrl}?perPage=${pageSize}&pageNumber=${pageNumber}`
    );
    const json: HedinApiResponse = await result.json();
    const brands = extractBrands(json);
    
    function *data() {
      for (const car of json.cars) {
        const id  = car.link.href.split('/')[2];
        const { brand, model, title } = parseCarName(car.title, brands);
        yield {
          id,
          fullName: car.title,
          title,
          brand: brand?.name,
          model: model?.name,

          year: car.vehicleDetails.year,
          mileage: car.vehicleDetails.mileage,
          condition: car.condition.toLowerCase(),
          fuel: car.vehicleDetails.fuel.toLowerCase(),
          price: car.prices.buyOut > 0 ? car.prices.buyOut : car.prices.original,
          // leasePrice?: ,

          locationName: car.facilityCity,
          facilityName: car.facilityName,
        } as CarModel;
      }
    }

    return {
      totalCount: json.totalCount,
      pageSize: json.perPage,
      data,
    };
  }
}

function extractBrands(response: HedinApiResponse): Brand[] {
  const brandFilter = response.filterOr.find(f => f.key === 'br');

  if (brandFilter === undefined) {
    return [];
  }

  return brandFilter.options.map(option => ({
      id: option.brandId, 
      name: option.brandName, 
      models: option.carModels.map(m => ({ id: m.modelId, name: m.modelName })).sort((a, b) => b.name.length - a.name.length)
    }));
}

function parseCarName(fullName: string, brands: Brand[]): { brand?: Brand; model?: Model; title: string } {
  const brand = brands.find(b => fullName.startsWith(b.name));

  if (brand === undefined) {
    return { title: fullName };
  }

  const nameWithoutBrand = fullName.slice(brand.name.length + 1);
  const model = brand.models.find(m => nameWithoutBrand.startsWith(m.name));

  if (model === undefined) {
    return { brand, title: nameWithoutBrand };
  }

  const nameWithoutModel = nameWithoutBrand.slice(model.name.length + 1);
  return { brand, model, title: nameWithoutModel };
}

interface Brand {
  id: string;
  name: string;
  models: Model[];
}

interface Model {
  id: string;
  name: string;
}