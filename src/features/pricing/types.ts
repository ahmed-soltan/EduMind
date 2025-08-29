
export type Plan = {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  billing_cycle: "monthly" | "yearly";
  annual_discount_percent: number;
  annualPrice: number;
};