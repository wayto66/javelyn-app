import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDragDrop2,
  IconEdit,
  IconPlus,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Category } from "~/types/graphql";
import { handlePanelChange } from "~/helpers/handlePanelChange";

const CategoryItem = ({
  category,
  handleClick,
}: {
  category: Category;
  handleClick: (v: Category) => void;
}) => {
  return (
    <div className="flex w-full flex-row items-center rounded-md bg-gray-200 px-6 py-2">
      <IconDragDrop2 className="text-gray-500" />
      <span className="ml-10 font-semibold">{category.name}</span>
      <IconEdit
        className="ml-auto cursor-pointer rounded-md p-1 text-gray-500 transition hover:bg-gray-300"
        onClick={() => handleClick(category)}
        size={30}
      />
    </div>
  );
};

const CategoryPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [categories, setProducts] = useState<Category[]>([]);
  const [categoryTotalCount, setProductTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);

  const getCategories = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!session || !session.user) {
      console.error("No session/user found.", session);
      return;
    }
    const response = await fetchData({
      query: `
      query categories {
        categories(page: ${page}, pageSize: 55, filters: {
          companyId: ${session?.user.companyId}
        }) {
          objects {
          id
          name
          }
          total
        }
      }
      `,
      token: session.user.accessToken,
      ctx,
    });
    const categories = response?.data?.categories.objects;
    setProductTotalCount(response?.data.categories.total);
    if (!categories) return;

    setProducts(categories);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleEdit = (category: Category) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentCategoryData: category,
      };
    });
    handlePanelChange("products-category-edit", ctx, router);
  };

  const categoryDisplay = useMemo(() => {
    console.log({ categories });
    const display: JSX.Element[] = [];
    for (const category of categories) {
      const categoryLine = (
        <CategoryItem
          handleClick={handleEdit}
          category={category}
        ></CategoryItem>
      );
      display.push(categoryLine);
    }

    return display;
  }, [categories]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-2 rounded-md">
        <div className="flex flex-row items-center justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Categorias</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() =>
              handlePanelChange("products-category-create", ctx, router)
            }
          >
            <IconPlus />
            <span>Criar categoria</span>
          </PurpleButton>
        </div>

        <div className="mt-12 flex w-full flex-col gap-2 ">
          {categoryDisplay}
        </div>
      </div>
    </>
  );
};

export default CategoryPanel;
