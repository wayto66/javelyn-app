import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { useRouter } from "next/router";
import { TaskCategory, UpdateTaskInput } from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { MultiLeadSelection } from "~/components/minis/MultiLeadSelection";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { handlePanelChange } from "~/helpers/handlePanelChange";

const EditTaskPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const { register, getValues, reset, watch, setValue } =
    useForm<UpdateTaskInput>({
      defaultValues: ctx.data.currentTaskData,
    });

  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);

  const updateTask = async (e: FormEvent) => {
    e.preventDefault();
    const { body, categoryId, title, leadIds, targetDate } = getValues();
    const response = await fetchData({
      mutation: `
        mutation {
        updateTask(updateTaskInput: {
          id: ${ctx.data.currentTaskData?.id}
        title: "${title}"
        body: "${body}"
        companyId: ${session?.user.companyId}
        userId: ${session?.user.id}
 
        targetDate: "${
          new Date(targetDate).toISOString().split("T")[0] + "T12:00:00.000Z"
        }"
        }) {
        title
        id
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("Task atualizada com sucesso!");
      handlePanelChange("tasks", ctx, router);
    } else {
      toast.error("Houve um erro ao atualizar a task.");
    }
  };

  const getCategories = async (e?: FormEvent) => {
    e?.preventDefault();
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
      token: session?.user.accessToken,
      ctx,
    });
    const receivedTaskCategories = response?.data?.taskCategories.objects;
    if (!receivedTaskCategories) return;
    setTaskCategories(receivedTaskCategories);
  };

  const categoryOptions = useMemo(() => {
    const options: JSX.Element[] = [];
    for (const category of taskCategories) {
      const option = (
        <option style={{}} value={category.id}>
          {category.name}
        </option>
      );
      options.push(option);
    }

    if (taskCategories[0]) setValue("categoryId", taskCategories[0]?.id ?? 0);
    return options;
  }, [taskCategories]);

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    setValue("targetDate", ctx.data.currentTaskData?.targetDate.split("T")[0]);
    setValue("categoryId", ctx.data.currentTaskData?.category.id);
    console.log({ cid: ctx.data.currentTaskData?.category.id });
  }, [ctx.data.currentTaskData]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Editar Task
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={updateTask}>
          <MultiLeadSelection getValues={getValues} setValue={setValue} />

          <div className="flex w-full flex-row gap-6">
            <div className="flex basis-[63%] flex-col">
              <span className="text-sm text-gray-500">Título</span>
              <input
                type="text"
                className="rounded-lg border px-2 py-1"
                {...register("title")}
                required
              />
            </div>
            <div className="flex grow flex-col">
              <span className="text-sm text-gray-500">Data</span>
              <input
                type="date"
                className="rounded-lg border px-2 py-1"
                {...register("targetDate")}
                required
              />
            </div>
          </div>

          {/* <div className="flex flex-col">
            <span className="text-sm text-gray-500">Categoria</span>
            <select
              className="w-full rounded-lg border px-2 py-1"
              {...register("categoryId")}
              required
            >
              {categoryOptions}
            </select>
          </div> */}

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Descrição</span>
            <textarea
              className="rounded-lg border px-2 py-1"
              {...register("body")}
              required
            />
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("tasks", ctx, router)}
            >
              Voltar
            </button>
            <button className="rounded-md border bg-jpurple px-5 py-1 font-semibold text-white transition hover:bg-jpurple/80">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditTaskPanel;
