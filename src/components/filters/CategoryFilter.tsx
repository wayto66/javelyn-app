import { useSession } from "next-auth/react";
import {
  useContext,
  useState,
  FormEvent,
  ChangeEvent,
  useEffect,
  useMemo,
} from "react";
import {
  UseFormWatch,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { AppFilterInput } from "~/types/AppFiltersInput";
import { Category } from "~/types/graphql";

export type CategoryFilterParams = {
  watch: UseFormWatch<AppFilterInput>;
  register: UseFormRegister<AppFilterInput>;
  setValue: UseFormSetValue<AppFilterInput>;
  defaultValue: { id: number; name: string };
};

export const CategoryFilter = ({
  setValue,
  defaultValue,
  watch,
}: CategoryFilterParams) => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [_, rr] = useState(0);

  const getCategories = async (e?: FormEvent) => {
    e?.preventDefault();
    const response = await fetchData({
      query: `
      query categories {
        categories(page: 1, pageSize: 999) {
          objects {
          id
          name
          }
        }
      }
      `,
      token: session?.user.accessToken,
      ctx,
    });
    const categories = response?.data?.categories.objects;
    if (!categories) return;
    setCategories(categories);
  };

  const handleCategoryChange = (e: ChangeEvent) => {
    const target = e.target as HTMLSelectElement;
    const value =
      target.value === "undefined" ? target.value : Number(target.value);

    const optionElement = document.querySelector(
      `.filter-modal-category-option[value="${value}"]`
    );
    if (!optionElement) return;
    const name = optionElement.innerHTML;

    setValue("category", {
      id: value as any,
      name,
    });

    rr((prev) => prev + 1);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const categoryOptions = useMemo(() => {
    const options: JSX.Element[] = [];
    const option = (
      <option className="filter-modal-category-option" value={"undefined"}>
        TODAS
      </option>
    );
    options.push(option);
    for (const category of categories) {
      const option = (
        <option
          className="filter-modal-category-option"
          key={`filter-modal-category-option-${category.id}`}
          value={category.id}
        >
          {category.name}
        </option>
      );
      options.push(option);
    }
    return options;
  }, [categories]);

  useEffect(() => {
    if (!defaultValue) return;
    setValue("category", defaultValue);
  }, [categoryOptions]);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm">Filtrar por Categoria</div>
      <select
        className="rounded-lg border px-2 py-1"
        value={watch("category.id")}
        onChange={(e) => handleCategoryChange(e)}
        required
      >
        {categoryOptions}
      </select>
    </div>
  );
};
