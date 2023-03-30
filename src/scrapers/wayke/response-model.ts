export interface WaykeApiResponse {
  response: {
    facets: FacetApiResponse[],
    documentList: {
      numberOfHits: number;
      pagination: {
        offset: number;
        hitsPerPage: number;
      };
      documents: DocumentApiResponse[];
    }
  }
}

export interface FacetApiResponse {
  id: string;
  displayName: string;
  filters: FacetFilterApiResponse[];
}

export interface FacetFilterApiResponse {
  displayName: string;
  count: number;
}

export interface DocumentApiResponse {
  id: string;
  fuelType: FuelApiResponse;
  manufacturer: string;
  modelSeries: string;
  modelYear: number;
  price: number;
  title: number;
  shortDescription: string;
  position: {
    city: string;
  }
  mileage: number;
}

export type FuelApiResponse = 
  | 'Diesel'
  | 'Bensin'
  | 'Laddhybrid'
  | 'El'
  | 'Elhybrid'
  | 'Bensin/E85'
  | 'Bensin/Naturgas'
  | 'Naturgas'
  | 'Bensin/Diesel'
  | 'E85'
  | 'Bensin/E85/Naturgas'
  | 'LPG'
  | 'Bensin/LPG'
  | 'Diesel/E85';