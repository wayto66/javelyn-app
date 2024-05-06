export type TDateFilterValue =
  | {
      gte: Date;
      lte: Date;
    }
  | undefined;

export type TListFilterValue = {
  date?: TDateFilterValue;
  clientName?: string;
  clientPhone?: string;
  user?: string;
  includeTrashed?: boolean;
  includeConverted?: boolean;
};
