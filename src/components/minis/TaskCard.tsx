import {
  IconCheck,
  IconEdit,
  IconCircleCheck,
  IconTrash,
  IconRestore,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { Lead, Task } from "~/types/graphql";

type TTaskCardParams = {
  task: Task;
  onEdit: (task: Task) => void;
  onRemove?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  taskFinalize?: (task: Task) => void;
};

export const TaskCard = ({
  task,
  onEdit,
  onRemove,
  onRestore,
  taskFinalize,
}: TTaskCardParams) => {
  const taskDate = new Date(task.targetDate);
  taskDate.setHours(taskDate.getHours() + 3);

  const handleLeadClick = (lead: Lead | null) => {
    if (!lead?.phone) {
      toast.error("Este lead não tem um número de telefone cadastrado.");
      return;
    }
    window.open(`https://wa.me/${lead.phone}`, "_blank");
  };
  return (
    <div
      className="flex flex-col gap-4 rounded-md p-3 opacity-50 shadow-xl transition hover:bg-gray-300"
      style={{
        background: task.category.color,
        color: getOptimalTextColor(task.category.color),
        opacity: task.isActive && !task.isHandled ? 1 : 0.85,
      }}
      key={`task-box-${task.id}`}
    >
      <div className="flex flex-row justify-between gap-6">
        <div className="px-2 text-xl font-bold">{task.title}</div>
        <div className="flex flex-col">
          <span className="px-2 text-right text-sm font-bold">
            {taskDate.toLocaleDateString("pt-BR")}
          </span>
          <span className="px-2 text-sm">{task.user?.name}</span>
        </div>
      </div>
      <div className="mt-[-20px] px-2 opacity-70">{task.category.name}</div>
      <div className="my-5 flex flex-col px-2">
        <span className="text-sm font-semibold">Descrição</span>
        <span>{task.body}</span>
      </div>
      {task.conclusion !== "INDEFINIDO" && (
        <div className="mb-5 flex flex-col px-2">
          <span className="text-sm font-semibold">Conclusão</span>
          <span>{task.conclusion}</span>
        </div>
      )}

      <div className="mt-auto flex flex-col">
        <div className="px-2 text-sm opacity-60">Para:</div>
        <ul className="list-inside list-disc px-2">
          {task.targets?.map((lead) => (
            <li
              className="group flex cursor-pointer flex-row items-center rounded-md px-2 transition hover:bg-white/50"
              onClick={() => handleLeadClick(lead)}
            >
              <IconBrandWhatsapp
                className="pr-3 group-hover:text-green-600"
                size={35}
              />{" "}
              {lead?.name}
            </li>
          ))}
        </ul>
      </div>
      {task.isHandled ? (
        <div className="ml-auto flex gap-2 font-bold">
          {" "}
          Tarefa concluída <IconCheck />{" "}
        </div>
      ) : (
        <div className="mt-auto ml-auto flex flex-row gap-2 px-2 font-normal text-gray-500">
          <IconEdit
            style={{
              color: getOptimalTextColor(task.category.color),
            }}
            className="cursor-pointer transition hover:bg-gray-400/50"
            onClick={() => onEdit(task)}
          />
          {taskFinalize && !task.isHandled && (
            <IconCircleCheck
              style={{
                color: getOptimalTextColor(task.category.color),
              }}
              className="cursor-pointer rounded-md transition hover:bg-gray-400/50"
              onClick={() => taskFinalize(task)}
            />
          )}
          {onRemove &&
            onRestore &&
            (task.isActive ? (
              <IconTrash
                style={{
                  color: getOptimalTextColor(task.category.color),
                }}
                className="cursor-pointer transition hover:bg-gray-400/50"
                onClick={() => onRemove(task)}
              />
            ) : (
              <IconRestore
                style={{
                  color: getOptimalTextColor(task.category.color),
                }}
                className="cursor-pointer transition hover:bg-gray-400/50"
                onClick={() => onRestore(task)}
              />
            ))}

          {!task.isActive && (
            <div className="ml-auto text-xs font-bold text-red-500">
              Desativada
            </div>
          )}
        </div>
      )}
    </div>
  );
};
