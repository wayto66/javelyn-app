import { SortBy } from "./graphql";

export type AppFilterInputKey =
  | "tags"
  | "name"
  | "sort"
  | "includeInactive"
  | "demandAllConditions"
  | "category"
  | "createdAt"
  | "products"
  | "companyId"
  | "userId"
  | "customFilters";

export type AppFilterInput = {
  tags?: { id: number; name: string }[];
  category?: { id: number; name: string };
  products?: { id: number; name: string }[];
  name?: string;
  sort?: SortBy;
  includeInactive?: boolean;
  demandAllConditions: boolean;
  createdAt?: { gt: string; lt: string };
  companyId?: number;
  userId?: number;
  customFilters?: Record<string, any>;
};
