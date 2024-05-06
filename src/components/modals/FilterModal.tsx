import { IconX } from "@tabler/icons-react";
import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { TagSelectionBox } from "../minis/TagSelectionBox";
import { AtributeType, AtributeValueType, SortBy, Tag } from "~/types/graphql";
import { DefaultButton } from "../micros/DefaultButton";
import { AppFilterInput } from "~/types/AppFiltersInput";
import { useRouter } from "next/router";
import { reactContext } from "~/pages/_app";
import { CategoryFilter } from "../filters/CategoryFilter";
import { DateFilter } from "../filters/DateFilter";
import { ProductFilter } from "../filters/ProductFilter";
import { BooleanCustomFilter } from "../micros/BooleanCustomFilter";
import { triToggleValueConvert } from "~/helpers/triToggleValueConvert";
import { TextCustomFilter } from "../micros/TextCustomFilter";

export enum FilterNames {
  CATEGORY,
  CREATED_AT,
  PRODUCTS,
}

export const ExtraFiltersMap = new Map<FilterNames, any>([
  [
    FilterNames.CATEGORY,
    (props: React.ComponentProps<any>) => <CategoryFilter {...props} />,
  ],
  [
    FilterNames.CREATED_AT,
    (props: React.ComponentProps<any>) => <DateFilter {...props} />,
  ],
  [
    FilterNames.PRODUCTS,
    (props: React.ComponentProps<any>) => <ProductFilter {...props} />,
  ],
]);

type FilterModalParams = {
  visibility: boolean;
  setVisibility: Dispatch<SetStateAction<boolean>>;
  setFilters: Dispatch<SetStateAction<AppFilterInput>>;
  filters: AppFilterInput;
  extraFilters?: FilterNames[];
};

export const FilterModal = ({
  visibility,
  setVisibility,
  setFilters,
  filters,
  extraFilters,
}: FilterModalParams) => {
  const router = useRouter();
  const ctx = useContext(reactContext);
  const { register, getValues, setValue, watch } = useForm<AppFilterInput>({
    defaultValues: {
      includeInactive: filters?.includeInactive,
      sort: filters?.sort,
      tags: filters?.tags,
      demandAllConditions: true,
      category: filters?.category,
      createdAt: {
        gt: filters?.createdAt?.gt,
        lt: filters?.createdAt?.lt,
      },
    },
  });

  const {
    register: customFilterRegister,
    getValues: customFilterGetValues,
    watch: customFilterWatch,
  } = useForm();

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const closeModal = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    if ((e.target as HTMLDivElement).id === "filter-overlay")
      setVisibility((prev) => !prev);
  };

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();

    const customFilterValues = customFilterGetValues();
    const customFilters: Record<string, any> = {};
    for (const [key, value] of Object.entries(customFilterValues)) {
      const fieldType = ctx.data.attributes?.find(
        (attr) => attr.name === key
      )?.valueType;
      if (!fieldType) continue;
      if (!value || value.length === 0) continue;
      if (fieldType === AtributeValueType.BOOLEAN && value === "1") continue;

      customFilters[key] = value;
    }
    console.log({ customFilters });

    const {
      includeInactive,
      sort,
      demandAllConditions,
      category,
      createdAt,
      products,
    } = getValues();

    setFilters((prev) => {
      return {
        ...prev,
        includeInactive,
        demandAllConditions,
        sort,
        category,
        products,
        createdAt,
        tags: selectedTags.map((tag) => {
          return {
            id: tag.id,
            name: tag.name,
          };
        }),
        customFilters,
      };
    });

    const updatedQueryParams = {
      ...router.query,
      panel: router.query.panel ?? ctx.data.currentPanel,
      includeInactive: includeInactive?.toString(),
      demandAllConditions: demandAllConditions?.toString(),
      sort,
      tags: JSON.stringify(
        selectedTags.map((tag) => ({ id: tag.id, name: tag.name }))
      ),
      products: JSON.stringify(
        products?.map((product) => ({ id: product.id, name: product.name }))
      ),
    };

    // Atualizar a URL com os novos parâmetros da query
    router.push({
      pathname: router.route,
      query: updatedQueryParams,
    });

    setVisibility(false);
  };

  useEffect(() => {
    if (!visibility) {
      document.body.removeEventListener("onkeyup", (e: any) => escHandler(e));
      return;
    }

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVisibility(false);
      }
    };

    document.body.onkeyup = (e: KeyboardEvent) => escHandler(e);
  }, [visibility]);

  const extraFiltersDisplay = useMemo(() => {
    const elements: JSX.Element[] = [];
    if (!extraFilters) return elements;
    for (const filter of extraFilters) {
      const filterElement = ExtraFiltersMap.get(filter)({
        watch,
        setValue,
        defaultValue: filters?.category,
        register,
        getValues,
        filters,
      });
      elements.push(filterElement);
    }

    return elements;
  }, [extraFilters]);

  const customFiltersDisplay = useMemo(() => {
    const attributes = ctx.data.attributes;
    const leadAttributes = attributes?.filter((att) =>
      att.types.includes(AtributeType.LEAD)
    );
    const elements: JSX.Element[] = [];
    if (!leadAttributes) return elements;
    for (const attribute of leadAttributes) {
      if (!attribute.isActive) continue;
      if (attribute.valueType === AtributeValueType.BOOLEAN) {
        elements.push(
          <BooleanCustomFilter
            attribute={attribute}
            register={customFilterRegister}
            watch={customFilterWatch}
          />
        );
      }
      if (attribute.valueType === AtributeValueType.STRING) {
        elements.push(
          <TextCustomFilter
            attribute={attribute}
            register={customFilterRegister}
            watch={customFilterWatch}
          />
        );
      }

      if (attribute.valueType === AtributeValueType.NUMBER) {
        elements.push(
          <TextCustomFilter
            attribute={attribute}
            register={customFilterRegister}
            watch={customFilterWatch}
          />
        );
      }
    }

    return elements;
  }, [extraFilters]);

  return (
    <>
      {visibility && (
        <div
          className="fixed inset-0 z-[50] h-screen w-screen overflow-y-auto bg-black/50"
          id="filter-overlay"
          onClick={(e) => closeModal(e)}
        >
          <form
            className="ml-auto flex h-screen min-w-[30vw] max-w-[50vw] flex-col gap-6 overflow-y-auto bg-white p-5"
            onSubmit={handleFilterSubmit}
          >
            <div className="flex w-full justify-between border-b pb-2">
              <IconX
                className="cursor-pointer transition hover:bg-gray-200"
                onClick={() => setVisibility(false)}
              />
              <DefaultButton>Filtrar</DefaultButton>
            </div>
            <div className="text-3xl font-bold">Filtrar por</div>

            <div className="flex flex-col gap-1">
              <div className="text-sm">Ordenar por</div>
              <select
                className="w-full rounded-md border px-2 py-1"
                {...register("sort")}
              >
                <option value={SortBy.NEWER}>Mais novos primeiro</option>
                <option value={SortBy.OLDER}>Mais antigos primeiro</option>
                <option value={SortBy.COSTLIER}>Maior preço</option>
                <option value={SortBy.CHEAPER}>Menor preço</option>
                <option value={SortBy.AZ}>A - Z</option>
                <option value={SortBy.ZA}>Z - A</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm">Filtrar por tags</div>
              <TagSelectionBox
                selectedTagId={selectedTagId}
                selectedTags={selectedTags}
                setSelectedTagId={setSelectedTagId}
                setSelectedTags={setSelectedTags}
              />
            </div>

            {extraFiltersDisplay}

            <div className="mb-4 grid grid-cols-2 gap-x-12 gap-y-2">
              {customFiltersDisplay}
            </div>

            <div className="grid grid-cols-2 items-center gap-4 rounded-md border p-2">
              <div className="flex flex-row items-center justify-center gap-4">
                <input type="checkbox" {...register("includeInactive")} />
                <div className="">Incluir desativados</div>
              </div>
              <div className="flex flex-row items-center justify-center gap-4">
                <input type="checkbox" {...register("demandAllConditions")} />
                <div className="">Exigir todas as condições</div>
              </div>
            </div>

            <div className="mt-auto flex w-full justify-between border-t pt-2">
              <DefaultButton className="ml-auto">Filtrar</DefaultButton>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
