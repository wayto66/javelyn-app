import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  MouseEventHandler,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { ShineButton } from "../../micros/ShineButton";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconDownload,
  IconEdit,
  IconFilter,
  IconFilters,
  IconLoader2,
  IconPlus,
  IconRestore,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { SortBy, Task } from "~/types/graphql";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { PageSelectDisplay } from "~/components/minis/PageSelector";
import { useForm } from "react-hook-form";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { toast } from "react-toastify";
import taskCategoryToTailwindBg from "~/helpers/taskCategoryToTailwindBg";
import { DateSelectorModal } from "~/components/modals/DateSelectorModal";
import { TaskFinalizeModal } from "~/components/modals/TaskFinalizeModal";
import { Toggle } from "~/components/micros/Toggle";
import { TaskCard } from "~/components/minis/TaskCard";

type TaskFilters = {
  name: string;
  sort: SortBy;
  includeInactive: boolean;
  includeHandled: boolean;
};

type DateFilter = {
  gt: string;
  lt: string;
};

const TaskPanel = () => {
  const today = new Date();
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [dateSelectorVisible, showDateSelector] = useState(false);
  const [taskFinalizeVisible, showTaskFinalizeModal] = useState(false);
  const [filterDate, setFilterDate] = useState<DateFilter>({
    gt:
      router.query.gt?.toString() ??
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      ).toISOString(),
    lt:
      router.query.lt?.toString() ??
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      ).toISOString(),
  });
  const [tasks, setTasks] = useState<Task[]>();
  const [taskTotalCount, setTaskTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { register, getValues } = useForm<TaskFilters>({
    defaultValues: {
      sort: SortBy.NEWER,
      includeInactive: false,
    },
  });

  const getTasks = async (e?: FormEvent) => {
    e?.preventDefault();
    setTaskTotalCount(0);
    setTasks(undefined);
    const { name, sort, includeInactive, includeHandled } = getValues();
    const response = await fetchData({
      query: `
      query tasks {
                tasks(page: ${page}, pageSize: ${pageSize}, filters: {
          companyId: ${session?.user.companyId}
          name: "${name}",
          sort: ${sort},
          includeInactive: ${includeInactive}
          includeHandled: ${includeHandled}
          dateGt: "${filterDate?.gt ?? ""}"
          dateLt: "${filterDate?.lt ?? ""}"
          ${
            session?.user.permissions.seeAllTasks
              ? ""
              : "userId: " + session?.user.id
          }
        }) {
          objects {
          id
          title
          body          
          targetDate
          targets {
            id
            name
            phone
          }
          category {
            id
            name
            color
          }
          user {
            id
            name
          }
          conclusion
          observation
          isHandled
          isActive
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const tasks = response?.data?.tasks.objects;
    setTaskTotalCount(response?.data.tasks.total);
    if (!tasks) return;

    setTasks(tasks);
  };

  const handleTaskEdit = async (task: Task) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentTaskData: task,
      };
    });
    handlePanelChange("tasks-edit", ctx, router);
  };

  const handleTaskRemove = (task: Task) => {
    const removeTask = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeTask (id: ${task.id}) {
        id
        title
        }
        }
        `,
      });
      if (response) {
        toast.success("Task desativada com sucesso.");
        setTasks((prev) => {
          if (!prev) return [];
          const _tasks = [...prev];
          const index = _tasks.findIndex((_task) => _task.id === task.id);
          const _task = _tasks[index];
          if (!_task) return prev;
          const updatedTask: Task = { ..._task, isActive: false };

          _tasks[index] = updatedTask;

          return _tasks;
        });
      } else toast.error("Houve um erro ao desativar a task.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja desativar a task: ${task.id} ?`,
          action: async () => {
            await removeTask();
          },
          visible: true,
        },
      };
    });
  };

  const handleTaskRestore = async (task: Task) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateTask (updateTaskInput:{
                  id: ${task.id}
                  isActive: true
                }) {
                  id
                  title
                  isActive
                }
              }
        `,
    });

    if (response) {
      toast.success("Task reativada com sucesso!");
      setTasks((prev) => {
        if (!prev) return [];
        const _tasks = [...prev];
        const index = _tasks.findIndex((_task) => _task.id === task.id);
        const _task = _tasks[index];
        if (!_task) return prev;
        const updatedTask: Task = { ..._task, isActive: true };

        _tasks[index] = updatedTask;

        return _tasks;
      });
    } else toast.error("Houve um erro ao reativar a task.");
  };

  useEffect(() => {
    getTasks();
  }, [page, filterDate]);

  const taskFinalize = (task: Task) => {
    ctx.setData((prev) => {
      return { ...prev, currentTaskData: task };
    });
    openTaskFinalizeModal();
  };

  const closeDateSelectorModal = () => showDateSelector(false);
  const openDateSelectorModal = () => showDateSelector(true);
  const closeTaskFinalizeModal = () => showTaskFinalizeModal(false);
  const openTaskFinalizeModal = () => showTaskFinalizeModal(true);

  const selectFilterDate = (inputDate: string) => {
    setFilterDate({
      gt: inputDate + "T00:00:00.000Z",
      lt: inputDate + "T23:59:59.000Z",
    });
    closeDateSelectorModal();
  };

  const taskDisplay = useMemo(() => {
    if (!tasks) return;
    const display: JSX.Element[] = [];
    for (const task of tasks) {
      const taskBox = (
        <TaskCard
          task={task}
          onEdit={handleTaskEdit}
          onRemove={handleTaskRemove}
          onRestore={handleTaskRestore}
          taskFinalize={taskFinalize}
        ></TaskCard>
      );
      display.push(taskBox);
    }

    return (
      <div className="mt-6 mb-12 grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3 ">
        {display}
      </div>
    );
  }, [tasks]);

  const dateDisplay = useMemo(() => {
    const date = new Date(filterDate.gt);
    date.setHours(date.getHours() + 3);
    return date.toLocaleDateString("pt-BR");
  }, [filterDate]);

  return (
    <>
      <DateSelectorModal
        isVisible={dateSelectorVisible}
        handleClose={closeDateSelectorModal}
        selectDate={selectFilterDate}
      />
      <TaskFinalizeModal
        isVisible={taskFinalizeVisible}
        handleClose={closeTaskFinalizeModal}
      />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Tasks</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("tasks-create", ctx, router)}
          >
            <IconPlus />
            <span>Criar task</span>
          </PurpleButton>
        </div>

        <div className="mt-4 flex flex-row justify-between gap-6">
          <form onSubmit={getTasks} className="h-full grow">
            <input
              type="text"
              className="h-full w-full rounded-md border border-slate-300 px-6"
              {...register("name")}
            />
          </form>
          <button
            className="flex flex-row items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:border-jpurple"
            onClick={openDateSelectorModal}
          >
            <IconCalendar />
            <span className="text-sm font-semibold">{dateDisplay}</span>
          </button>
          <button
            className="flex flex-row gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:border-jpurple"
            onClick={getTasks}
          >
            <IconSearch />
            <span className="text-sm font-semibold">Buscar</span>
          </button>
        </div>

        <div className="mt-4 flex flex-row justify-between gap-6">
          <div className=" flex flex-row items-center gap-8 rounded-md  font-semibold">
            <div className="flex flex-row items-center gap-2">
              <Toggle
                parameter={"includeInactive"}
                register={register as any}
              />
              <span className="text-sm font-semibold">
                Incluir tasks desativadas
              </span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <Toggle parameter={"includeHandled"} register={register as any} />
              <span className="text-sm font-semibold">
                Incluir tasks concluídas
              </span>
            </div>
          </div>
        </div>

        <PageSelectDisplay
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={taskTotalCount}
        />

        {tasks ? (
          <>{taskDisplay}</>
        ) : (
          <div className="flex min-h-[500px] w-full items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default TaskPanel;
