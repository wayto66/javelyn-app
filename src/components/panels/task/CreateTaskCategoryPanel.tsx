import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { FormEvent, useContext, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { useRouter } from "next/router";
import { TaskCategory, CreateTaskCategoryInput } from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const CreateTaskCategoryPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const { register, getValues, reset } = useForm<CreateTaskCategoryInput>();

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

  const createTaskCategory = async (e: FormEvent) => {
    e.preventDefault();
    const { name, color } = getValues();

    const response = await fetchData({
      mutation: `
        mutation {
        createTaskCategory(createTaskCategoryInput: {
        name: "${name}"
        color: "${color}"
        companyId: ${session?.user.companyId}
        }) {
        name
        id
        companyId
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("TaskCategoria criada com sucesso!");
      handlePanelChange("tasks-categories");
      reset();
    } else {
      toast.error("Houve um erro ao criar a taskTaskCategoria.");
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Criar Categoria
          </div>
        </div>

        <form
          className="mt-12 flex flex-col gap-4"
          onSubmit={createTaskCategory}
        >
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Nome</span>
            <input
              type="text"
              className="rounded-lg border px-2 py-1"
              {...register("name")}
              required
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Cor</span>
            <input
              type="color"
              className="w-full rounded-lg border px-2 py-1"
              {...register("color")}
              required
            />
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("tasks-categories")}
            >
              Cancelar
            </button>
            <button className="rounded-md border bg-jpurple px-5 py-1 font-semibold text-white transition hover:bg-jpurple/80">
              Criar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTaskCategoryPanel;
