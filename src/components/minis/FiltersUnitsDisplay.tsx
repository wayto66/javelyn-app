import { IconTrash } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useContext, useMemo } from "react";
import { FilterUnit } from "../micros/FilterUnit";
import router from "next/router";
import { AppFilterInput, AppFilterInputKey } from "~/types/AppFiltersInput";
import { SortBy } from "~/types/graphql";
import { reactContext } from "~/pages/_app";
import { fetchData } from "next-auth/client/_utils";

type FiltersUnitsDisplayParams = {
  filters: AppFilterInput;
  setFilters: Dispatch<SetStateAction<AppFilterInput>>;
};

export const FiltersUnitsDisplay = ({
  filters,
  setFilters,
}: FiltersUnitsDisplayParams) => {
  const ctx = useContext(reactContext);

  const removeFilter = (
    filterKey: AppFilterInputKey,
    filterId?: string | number
  ) => {
    setFilters((prev) => {
      const _filters = { ...prev };
      if (filterId) {
        let array = _filters[filterKey] as any[];
        if (!array || !array.length) return prev;
        array = array.filter((obj: any) => obj.id !== filterId);
        return { ..._filters, [filterKey]: array };
      }

      if (filterKey === "tags") {
      }

      (_filters[filterKey] as any) = undefined;
      return _filters;
    });
  };

  const resetFilters = () => {
    setFilters({
      includeInactive: false,
      name: undefined,
      sort: SortBy.NEWER,
      tags: [],
      demandAllConditions: false,
    });
    router.push({
      pathname: router.pathname,
      query: {
        panel: router.query.panel ?? ctx.data.currentPanel ?? "home",
      },
    });
  };

  const filtersDisplay = useMemo(() => {
    if (!filters) return null;
    const resetButton = (
      <button
        className="group relative overflow-hidden rounded-md border px-2 py-1 text-slate-300 transition hover:bg-gray-300 hover:text-slate-700"
        onClick={resetFilters}
        key="filter-reset-button"
      >
        <IconTrash />
      </button>
    );

    const filtersElements: JSX.Element[] = [];

    if (filters.tags) {
      for (const tag of filters.tags) {
        const newElement = (
          <FilterUnit
            filterKey={"tags"}
            removeFilter={removeFilter}
            filterId={tag.id}
          >
            Possui tag: {tag.name}
          </FilterUnit>
        );

        filtersElements.push(newElement);
      }
    }

    if (filters.category) {
      const newElement = (
        <FilterUnit filterKey={"category"} removeFilter={removeFilter}>
          Categoria: {filters.category.name}
        </FilterUnit>
      );

      filtersElements.push(newElement);
    }

    const filterProducts =
      filters.products?.filter((prc) => prc.id !== 0) ?? [];

    console.log({ filterProducts });

    if (filterProducts.length > 0) {
      const newElement = (
        <FilterUnit filterKey={"products"} removeFilter={removeFilter}>
          Produto(s): {filterProducts.map((p) => p.name).join(", ")}
        </FilterUnit>
      );

      filtersElements.push(newElement);
    }

    if (filtersElements.length > 0) {
      const conditionModeElement = (
        <FilterUnit
          filterKey={"demandAllConditions"}
          removeFilter={removeFilter}
        >
          {filters.demandAllConditions
            ? "Exigindo todas as condições: "
            : "Exigindo ao menos uma das condições: "}
        </FilterUnit>
      );
      filtersElements.push(conditionModeElement);
    }

    if (filters.createdAt?.gt && filters.createdAt?.lt) {
      const newElement = (
        <FilterUnit filterKey={"category"} removeFilter={removeFilter}>
          Data: {new Date(filters.createdAt.gt).toLocaleDateString("pt-BR")} até{" "}
          {new Date(filters.createdAt.lt).toLocaleDateString("pt-BR")}
        </FilterUnit>
      );
      filtersElements.push(newElement);
    }

    if (filters.includeInactive) {
      const newElement = (
        <FilterUnit filterKey={"includeInactive"} removeFilter={removeFilter}>
          Incluindo desativados
        </FilterUnit>
      );

      filtersElements.push(newElement);
    }

    if (filtersElements.length > 0)
      return [resetButton, ...filtersElements.reverse()];
    return [];
  }, [filters]);
  return <div className="flex flex-row flex-wrap gap-2">{filtersDisplay}</div>;
};
