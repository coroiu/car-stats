export interface CarModel {
  id: string;
  fullName: string;
  title?: string;
  brand?: string;
  model?: string;

  year: number;
  mileage: number;
  condition?: "begagnad" | "best" | "demo" | "ny" | "sample";
  fuel:
    | "bensin"
    | "diesel"
    | "el"
    | "elhybrid"
    | "laddhybrid"
    | "laddhybriddiesel"
    | "other";
  price: number;
  leasePrice?: number;

  locationName: string;
  facilityName?: string;
}
