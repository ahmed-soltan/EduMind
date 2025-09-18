export type Plan = {
  id: number;
  name: string;
  cents: number;
  description: string;
  features: string[];
  currency: string;
  annual_discount_percent: number;
  annualPrice: number;
};
