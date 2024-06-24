import { EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import {
  IconBox,
  IconCalendarPlus,
  IconChecklist,
  IconReceipt,
  IconTicket,
  IconUserPlus,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { reactContext } from "~/pages/_app";
import { BoxLoadingPlaceholder } from "../boxes/BoxLoadingPlaceholder";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { useRouter } from "next/router";
import { fetchData } from "~/handlers/fetchData";
import { Task } from "~/types/graphql";
import Script from "next/script";

const HomePanel = () => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const router = useRouter();
  const [usersOptions, setUsersOptions] = useState<any>();
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>();

  const handleEventClick = async (arg: EventClickArg) => {
    const date = arg.event.extendedProps.date as Date;
    await router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        gt: date.toISOString().split("T")[0] + "T00:00:00.000Z",
        lt: date.toISOString().split("T")[0] + "T23:59:59.000Z",
      },
    });
    handlePanelChange("tasks", ctx, router);
  };

  useEffect(() => {
    if (!session) return;
    getTasks();
  }, [session]);

  const getTasks = async (userIdForTasks?: number) => {
    const response = await fetchData({
      query: `
      query tasks {
        tasks(page: 1, pageSize: 9999, filters: {
        companyId: ${session?.user.companyId}
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

    const tasks = response?.data.tasks.objects as Task[];

    if (!tasks) {
      toast.error("Houve um erro inesperado, tente novamente.");
      return;
    }

    const newCalendarEvents: EventInput[] = [];
    const handledTaskMap = new Map<string, Task[]>([]);
    const pendingTasksMap = new Map<string, Task[]>([]);

    const handledTasks = tasks.filter((t) => t.isHandled === true);
    const pendingTasks = tasks.filter((t) => t.isHandled === false);

    for (const task of pendingTasks) {
      const taskDate = new Date(task.targetDate);
      taskDate.setHours(taskDate.getHours() + 3); // ADD 3 HOURS TO FIX THE OFFSET BETWEEN BR AND UTC
      const dateKey = `${taskDate.getFullYear()}-${
        taskDate.getMonth() + 1
      }-${taskDate.getDate()}`;
      const tasks = pendingTasksMap.get(dateKey);
      if (!tasks) {
        pendingTasksMap.set(dateKey, [{ ...task }]);
        continue;
      }
      pendingTasksMap.set(dateKey, [...tasks, { ...task }]);
    }

    for (const task of handledTasks) {
      const taskDate = new Date(task.targetDate);
      taskDate.setHours(taskDate.getHours() + 3); // ADD 3 HOURS TO FIX THE OFFSET BETWEEN BR AND UTC
      const dateKey = `${taskDate.getFullYear()}-${
        taskDate.getMonth() + 1
      }-${taskDate.getDate()}`;
      const tasks = handledTaskMap.get(dateKey);
      if (!tasks) {
        handledTaskMap.set(dateKey, [{ ...task }]);
        continue;
      }
      handledTaskMap.set(dateKey, [...tasks, { ...task }]);
    }

    const taskColorMap = new Map<string, string>([
      ["AVALIAÇÃO", "bg-teal-500"],
      ["LEAD", "bg-violet-500"],
      ["ORÇAMENTO", "bg-blue-500"],
      ["CLIENTE", "bg-orange-400"],
      ["PÓS-VENDA", "bg-emerald-500"],
      ["FALTA", "bg-jred"],
      ["RETORNO", "bg-pink-500"],
    ]);

    for (const [dateKey, tasks] of pendingTasksMap) {
      const date = new Date(dateKey);
      date.setHours(date.getHours() + 3);

      const color = "bg-[#0071ce]";
      newCalendarEvents.push({
        title: `${tasks.length} Tarefas`,
        date,
        id: "task-event-" + Math.random(),
        classNames: [
          color ?? "",
          "hover:bg-purple-500",
          "hover:scale-[0.97]",
          "transition",
          "p-1",
          "cursor-pointer",
          "font-bold",
        ],
        extendedProps: {
          date: date,
        },
      });
    }

    for (const [dateKey, tasks] of handledTaskMap) {
      const date = new Date(dateKey);
      date.setHours(date.getHours() + 3);
      newCalendarEvents.push({
        title: tasks.length + " FINALIZADAS",
        start: date,
        startEditable: true,
        durationEditable: true,
        end: date,
        id: "FINALIZADA-" + Math.random(),
        classNames: [
          "bg-gray-300",
          "hover:bg-purple-500",
          "hover:scale-[0.97]",
          "transition",
          "p-1",
          "cursor-pointer",
          "!text-slate-700",
          "font-bold",
        ],
        extendedProps: {
          date: date,
        },
        textColor: "black",
      });
    }
    setCalendarEvents(newCalendarEvents);
  };

  return (
    <>
      <div className="flex flex-col gap-6 ">
        <div className="flex w-full flex-col justify-between ">
          <div className="mb-6 grid grid-cols-5 justify-end gap-4 font-extrabold uppercase text-white">
            <div
              className={`flex cursor-pointer  flex-row items-center justify-between rounded-md bg-primary  p-4 text-center transition  hover:bg-jpurple hover:shadow-[2px_2px_25px_2px_rgba(123,104,238,0.5)]`}
              onClick={() => handlePanelChange("leads-create", ctx, router)}
            >
              <IconUserPlus size={20} className="" />
              Novo Lead
            </div>
            <div
              className={`flex  cursor-pointer flex-row items-center justify-between rounded-md  bg-primary  p-4 text-center transition hover:bg-jpurple hover:shadow-[2px_2px_25px_5px_rgba(123,104,238,0.5)]`}
              onClick={() => handlePanelChange("tasks-create", ctx, router)}
            >
              <i>
                <IconChecklist size={20} />
              </i>
              Nova tarefa
            </div>
            <div
              className={` flex cursor-pointer flex-row items-center justify-between gap-4 rounded-md bg-primary  p-4 text-center transition hover:bg-jpurple hover:shadow-[2px_2px_25px_5px_rgba(123,104,238,0.5)]`}
              onClick={() => handlePanelChange("quotes-create", ctx, router)}
            >
              <i>
                <IconReceipt size={20} />
              </i>
              Novo Orçamento
            </div>
            <div
              className={`flex cursor-pointer flex-row items-center justify-between rounded-md bg-primary p-4 text-center transition hover:bg-jpurple hover:shadow-[2px_2px_25px_5px_rgba(123,104,238,0.5)]`}
              onClick={() => handlePanelChange("tickets-create", ctx, router)}
            >
              <i>
                <IconTicket size={20} />
              </i>
              Nova venda
            </div>

            <div
              className={`flex  cursor-pointer flex-row items-center justify-between rounded-md bg-primary  p-4 text-center transition hover:bg-jpurple hover:shadow-[2px_2px_25px_5px_rgba(123,104,238,0.5)] `}
              onClick={() => handlePanelChange("products-create", ctx, router)}
            >
              <i>
                <IconBox size={20} />
              </i>
              Novo Produto
            </div>
          </div>

          <div
            className="flex max-h-[50vh] flex-col rounded-md p-4 "
            id="home-calendar"
          >
            {calendarEvents ? (
              <FullCalendar
                plugins={[dayGridPlugin]}
                dayHeaderClassNames={[
                  "bg-[mediumpurple]",
                  "rounded-t-md",
                  "text-white",
                  "font-extrabold",
                ]}
                firstDay={1}
                stickyHeaderDates
                titleFormat={{ year: "numeric", month: "long" }}
                headerToolbar={{
                  start: "title", // will normally be on the left. if RTL, will be on the right

                  center: "text ",

                  end: "today prev,next", // will normally be on the right. if RTL, will be on the left
                }}
                locale={"pt-BR"}
                initialView="dayGridMonth"
                expandRows={true}
                events={calendarEvents}
                eventBorderColor="white"
                eventInteractive={true}
                eventClick={handleEventClick}
                dayCellClassNames="bg-[#41424c] text-white !h-[100px]"
                nextDayThreshold={"20:00:00"}
                dateAlignment="month"
                dayMaxEventRows={2}
              />
            ) : (
              <BoxLoadingPlaceholder />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePanel;
