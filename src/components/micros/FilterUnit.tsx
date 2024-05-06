import { IconX } from "@tabler/icons-react";
import { AppFilterInputKey } from "~/types/AppFiltersInput";

type FilterUnitParams = {
  filterKey: AppFilterInputKey;
  filterId?: string | number;
  children: string | string[] | JSX.Element | JSX.Element[];
  removeFilter: (
    filterKey: AppFilterInputKey,
    filterId?: string | number
  ) => void;
};

export const FilterUnit = ({
  filterKey,
  filterId,
  children,
  removeFilter,
}: FilterUnitParams) => (
  <button
    className="group relative overflow-hidden rounded-md border px-2 py-1 text-slate-500 transition hover:bg-gray-300 hover:text-slate-700"
    onClick={() => removeFilter(filterKey, filterId)}
    key={`filter-unit-${Math.random()}`}
  >
    <div className="absolute inset-0 z-[3] flex items-center justify-center bg-gray-300 text-white opacity-0 transition group-hover:opacity-100">
      <IconX />
    </div>
    {children}
  </button>
);
