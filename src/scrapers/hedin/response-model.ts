export interface HedinApiResponse {
  cars: CarApiResponse[];
  perPage: number;
  pageNumber: number;
  productListPageSize: number;
  totalCount: number;
  productListPageSizeOr: number;
  totalCountOr: number;
  filterOr: FilterApiResponse[];
}

export interface CarApiResponse {
  link: {
    href: string;
    linkType: string;
    title: string;
    text: string;
    url: string;
  };
  title: string;
  vehicleType: string;
  wfstep: string;
  condition: string;
  vehicleDetails: {
    year: number;
    mileage: number;
    fuel: string;
    gearBox: string;
  };
  prices: {
    lease: {
      private: number | null;
      privateDuration: null;
      company: number | null;
      companyDuration: null;
    };
    monthly: number;
    monthlyDuration: null;
    buyOut: number;
    buyOutExclusiveTax: number;
    original: number;
    originalExclusiveTax: number;
  };
  facilityName: string;
  facilityCity: string;
  images: {
    variants: {
      preview?: {
        size: number;
        link: string;
        width: number;
        type: string;
        height: number;
      };
      thumbnail?: {
        size: number;
        link: string;
        width: number;
        type: string;
        height: number;
      };
      master?: {
        size: number;
        link: string;
        width: number;
        type: string;
        height: number;
      };
    };
  }[];
}

export type FilterApiResponse = BrandFilterApiResponse;

export interface BrandFilterApiResponse {
  key: "br";
  title: string;
  subKey: string;
  subTitle: string;
  minValue: number;
  maxValue: number;
  options: {
    brandId: string;
    brandName: string;
    carModels: {
      modelId: string;
      modelName: string;
      brandId: string;
    }[];
  }[];
}
