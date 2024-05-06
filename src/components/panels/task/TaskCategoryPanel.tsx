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
import { TaskCategory } from "~/types/graphql";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";

const TaskCategoryItem = ({
  taskCategory,
  handleClick,
}: {
  taskCategory: TaskCategory;
  handleClick: (v: TaskCategory) => void;
}) => {
  return (
    <div
      className="flex w-full flex-row items-center rounded-md bg-gray-200 px-6 py-2"
      style={{
        backgroundColor: taskCategory.color,
        color: getOptimalTextColor(taskCategory.color),
      }}
    >
      <IconDragDrop2 />
      <span className="ml-10 font-semibold">{taskCategory.name}</span>
      <IconEdit
        className="ml-auto cursor-pointer rounded-md p-1 transition hover:bg-black/50"
        onClick={() => handleClick(taskCategory)}
        size={30}
      />
    </div>
  );
};

const TaskCategoryPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [taskCategories, setProducts] = useState<TaskCategory[]>([]);
  const [taskCategoryTotalCount, setProductTotalCount] = useState<number>(0);

  const handlePanelChange = (panel: string) => {
    ctx?.setData((prev) => {
      return {
        ...prev,
        currentPanel: panel,
      };
    });

    router.push(router.route, {
      query: {
        panel: panel,
      },
    });
  };

  const getProducts = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!session || !session.user) {
      console.error("No session/user found.", session);
      return;
    }
    const response = await fetchData({
      query: `
      query taskCategories {
        taskCategories(page: 1, pageSize: 999, filters: {
          companyId: ${session?.user.companyId}
        }) {
          objects {
          id
          name
          color
          }
          total
        }
      }
      `,
      token: session.user.accessToken,
      ctx,
    });
    const taskCategories = response?.data?.taskCategories.objects;
    setProductTotalCount(response?.data.taskCategories.total);
    if (!taskCategories) return;

    setProducts(taskCategories);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleEdit = (taskCategory: TaskCategory) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentTaskCategory: taskCategory,
      };
    });
    handlePanelChange("tasks-category-edit");
  };

  const taskCategoryDisplay = useMemo(() => {
    console.log({ taskCategories });
    const display: JSX.Element[] = [];
    for (const taskCategory of taskCategories) {
      const taskCategoryLine = (
        <TaskCategoryItem
          handleClick={handleEdit}
          taskCategory={taskCategory}
        ></TaskCategoryItem>
      );
      display.push(taskCategoryLine);
    }

    return display;
  }, [taskCategories]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-2 rounded-md">
        <div className="flex flex-row items-center justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Categorias</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("tasks-category-create")}
          >
            <IconPlus />
            <span>Criar Categoria</span>
          </PurpleButton>
        </div>

        <div className="mt-12 flex w-full flex-col gap-2 ">
          {taskCategoryDisplay}
        </div>
      </div>
    </>
  );
};

export default TaskCategoryPanel;
