import { IconClipboardCheck, IconClipboardOff } from "@tabler/icons-react";
import { MouseEvent, useContext, useMemo, useState } from "react";
import PurpleButton from "../micros/PurpleButton";
import { reactContext } from "~/pages/_app";
import { Lead, Task, UpdateTaskInput } from "~/types/graphql";
import { useForm } from "react-hook-form";
import { Toggle } from "../micros/Toggle";
import { fetchData } from "~/handlers/fetchData";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { useRouter } from "next/router";

type TaskFinalizeModalParams = {
  handleClose: () => void;
  isVisible: boolean;
};

export const TaskFinalizeModal = ({
  handleClose,
  isVisible,
}: TaskFinalizeModalParams) => {
  const ctx = useContext(reactContext);
  const router = useRouter();
  const { data: session } = useSession();
  const task = ctx.data.currentTaskData as Task | undefined;
  const leads = task?.targets as Lead[] | undefined;

  const handleBackdropClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.id === "task-finalize-modal-backdrop") handleClose();
  };

  const { register, getValues } = useForm<UpdateTaskInput>({
    defaultValues: task,
  });

  const { register: extraRegister, getValues: extraGetValues } = useForm();

  const handleFinalizeTask = async () => {
    const { redirectToNewTask } = extraGetValues();
    const { conclusion } = getValues();

    const response = await fetchData({
      mutation: `
        mutation {
        updateTask(updateTaskInput: {
        id: ${ctx.data.currentTaskData?.id}
        isHandled: true
        conclusion: "${conclusion}"
        companyId: ${session?.user.companyId}
        }) {
        title
        id
        targets {
          id
          name
          phone
          isActive
        }
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (!response?.data?.updateTask) {
      toast.error("Houve um erro ao atualizar a tarefa.");
      return;
    }

    toast.success("Tarefa atualizada com sucesso!");

    const targets = response.data.updateTask.targets;
    if (redirectToNewTask) {
      ctx.setData((prev) => {
        return {
          ...prev,
          currentLeads: targets ?? [],
        };
      });
      handlePanelChange("tasks-create", ctx, router);
    }
    handleClose();
  };

  if (!isVisible) return <></>;

  return (
    <div
      className="fixed inset-0 top-0 left-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/50 backdrop-blur"
      id="task-finalize-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="flex max-h-[95vh] min-w-[40vw] flex-col gap-6 overflow-auto rounded-md bg-white p-6">
        <div
          className="mb-2 flex flex-row items-center justify-between gap-12 border-b-[2px] pb-2"
          style={{ borderColor: task?.category.color }}
        >
          <IconClipboardCheck />
          <span className="font-bold">Finalizar Tarefa</span>
        </div>
        <div className="text-xl font-bold">{task?.title}</div>
        <div
          className="mt-[-30px] font-semibold opacity-70"
          style={{ color: task?.category.color }}
        >
          {task?.category.name}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Descrição:</span>
          <div className="rounded-md border p-2">{task?.body}</div>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Leads:</span>
          <ul className="list-inside list-disc px-2">
            {leads?.map((lead) => (
              <li>{lead?.name}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Conclusão:</span>
          <textarea
            {...register("conclusion")}
            className="rounded-md border p-2"
          ></textarea>
        </div>

        <div className="flex w-full flex-row items-center gap-3 py-1">
          <Toggle parameter={"redirectToNewTask"} register={extraRegister} />

          <span className="text-sm text-gray-700">
            Direcionar leads para nova tarefa
          </span>
        </div>

        <PurpleButton onClick={handleFinalizeTask}>finalizar</PurpleButton>
      </div>
    </div>
  );
};
