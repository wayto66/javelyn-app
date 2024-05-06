import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { useRouter } from "next/router";
import {
  AtributeType,
  Attribute,
  Lead,
  Quote,
  Tag,
  Task,
  Ticket,
  UpdateLeadInput,
} from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import AttributePanel from "../attribute/AttributePanel";
import { AttributesDisplay } from "~/components/minis/AttributesDisplay";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { TaskCard } from "~/components/minis/TaskCard";
import { QuoteTableLine } from "~/components/micros/QuoteTableLine";
import { TicketTableLine } from "~/components/micros/TicketTableLine";

const EditLeadPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>();
  const [selectedExtraPanel, setSelectedExtraPanel] = useState("tasks");
  const [leadInfo, setLeadInfo] = useState<Lead | undefined>();

  const { register, resetField, setValue, getValues, reset, watch } =
    useForm<UpdateLeadInput>({
      defaultValues: ctx.data.currentLeadData,
    });

  const {
    register: customFieldsRegister,
    getValues: customFieldsGetValues,
    setValue: cfSetValue,
    watch: customFieldsWatch,
  } = useForm();

  const updateLead = async (e: FormEvent) => {
    e.preventDefault();
    const { id, observation, name, phone, CPF, mail } = getValues();
    const customFields = customFieldsGetValues();

    const tagsIds = selectedTags.map((t) => t.id);

    const response = await fetchData({
      mutation: `
        mutation($input: UpdateLeadInput!) {
        updateLead(updateLeadInput: $input) {
        id
        name
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
      variables: {
        input: {
          id: id,
          name,
          phone,
          mail,
          CPF,
          observation,
          companyId: session?.user.companyId,
          userId: session?.user.id,
          tagsIds,
          customFields,
        },
      },
    });

    if (response?.data.updateLead) {
      toast.success("Lead atualizado com sucesso!");
    } else if (response?.data.error) {
      toast.error(
        response.data.message ?? "Houve um erro inesperado ao atualizar o lead."
      );
    } else {
      toast.error("Houve um erro inesperado ao atualizar o lead.");
    }
  };

  const getLeadInfo = async () => {
    const response = await fetchData({
      query: `
      query lead {
        lead(id: ${ctx.data.currentLeadData?.id}) {
          id
          name
          observation
          CPF
          mail
          phone
          customFields
          tags {
            id
            name
            colorHex       
          }
          tasks {
            id
            title
            body
            conclusion
            targetDate
            isHandled
            isActive
            category {
              id
              name
              color
            }
          }
          quotes {
                 id
          leadId
          userId
          observation
          value
          isActive
          createdAt
          handledAt
          customFields
          tags {
            id
            name
            colorHex
          }
          lead {
            id
            name
          }
          user {
            id
            name
          }
          products {
            productId
            amount
            value
          }
          }
          tickets {
          id
          leadId
          userId
          value
          observation
          isActive
          createdAt
          customFields
          tags {
            id
            name
            colorHex
          }
          lead {
            id
            name
          }
          user {
            id
            name
          }
           products {
            productId
            amount
            value
          }
        }

        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const lead = response?.data?.lead as Lead | undefined;

    if (!lead) return;
    const { name, observation, CPF, mail, phone, tags, customFields } = lead;
    setValue("name", name);
    setValue("mail", mail);
    setValue("CPF", CPF);
    setValue("phone", phone);
    setValue("observation", observation);
    setValue("customFields", customFields);
    if (customFields) {
      for (const [key, value] of Object.entries(customFields)) {
        cfSetValue(key, value);
      }
    }
    setSelectedTags(tags as Tag[]);
    setLeadInfo(lead);
  };

  const handleTicketEdit = (ticket: Ticket) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentTicketData: ticket,
      };
    });
    handlePanelChange("tickets-edit", ctx, router);
  };

  const handleQuoteEdit = (quote: Quote) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentQuoteData: quote,
      };
    });
    handlePanelChange("quotes-edit", ctx, router);
  };

  const handleTaskEdit = async (task: Task) => {
    await router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        gt: task.targetDate.split("T")[0] + "T00:00:00.000Z",
        lt: task.targetDate.split("T")[0] + "T23:59:59.000Z",
      },
    });
    handlePanelChange("tasks", ctx, router);
  };

  const leadAttributes = useMemo(() => {
    const customFields = getValues("customFields") ?? [];
    const attributes: any[] = [];
    for (const [key, value] of Object.entries(customFields)) {
      const attribute = {
        name: key,
        value: value,
      };
      attributes.push(attribute);
    }
    return attributes;
  }, [watch("customFields")]);

  const tasksDisplay = useMemo(() => {
    const tasks = [...(leadInfo?.tasks ?? [])];

    tasks.sort((a, b) => a?.createdAt - b?.createdAt);

    return tasks?.map((task) => {
      if (task)
        return (
          <TaskCard
            task={{ ...task, targets: [leadInfo ?? null] }}
            onEdit={handleTaskEdit}
          />
        );
    });
  }, [leadInfo?.tasks, selectedExtraPanel]);

  const quotesDisplay = useMemo(() => {
    const quotes = leadInfo?.quotes?.sort(
      (a, b) => a?.createdAt - b?.createdAt
    );
    return quotes?.map((quote) => {
      if (quote)
        return <QuoteTableLine quote={quote} handleEdit={handleQuoteEdit} />;
    });
  }, [leadInfo?.quotes]);

  const ticketsDisplay = useMemo(() => {
    const tickets = leadInfo?.tickets?.sort(
      (a, b) => a?.createdAt - b?.createdAt
    );
    return tickets?.map((ticket) => {
      if (ticket)
        return (
          <TicketTableLine ticket={ticket} handleEdit={handleTicketEdit} />
        );
    });
  }, [leadInfo?.tickets]);

  useEffect(() => {
    if (!session) return;
    getLeadInfo();
  }, [session]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Editar Lead
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={updateLead}>
          <div className="grid w-full grid-cols-2 gap-6">
            <div className="flex flex-col">
              <div className="text-sm text-gray-500">Nome</div>
              <input
                type="text"
                className="rounded-md border px-2 py-1"
                {...register("name")}
              />
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-500">Telefone</div>
              <input
                type="number"
                className="rounded-md border px-2 py-1"
                {...register("phone")}
              />
            </div>

            <div className="flex flex-col">
              <div className="text-sm text-gray-500">E-mail</div>
              <input
                type="text"
                className="rounded-md border px-2 py-1"
                {...register("mail")}
              />
            </div>

            <div className="flex flex-col">
              <div className="text-sm text-gray-500">CPF</div>
              <input
                type="text"
                className="rounded-md border px-2 py-1"
                {...register("CPF")}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Tags</div>
            <TagSelectionBox
              selectedTagId={selectedTagId}
              selectedTags={selectedTags}
              setSelectedTagId={setSelectedTagId}
              setSelectedTags={setSelectedTags}
            />
          </div>

          <AttributesDisplay
            register={customFieldsRegister}
            watch={customFieldsWatch}
            type={AtributeType.LEAD}
            attributeValues={leadAttributes}
          />

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Observação</div>
            <textarea
              {...register("observation")}
              className="rounded-md border p-2"
            ></textarea>
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("leads", ctx, router)}
            >
              Voltar
            </button>
            <button className="rounded-md border bg-jpurple px-5 py-1 font-semibold text-white transition hover:bg-jpurple/80">
              Salvar
            </button>
          </div>
        </form>
      </div>

      <div className="mx-auto mt-12 mb-32 flex w-full min-w-[50vw] max-w-[1200px] flex-col rounded-md border shadow-xl">
        <div className="grid grid-cols-3 rounded-t-md bg-white ">
          <div
            className={`cursor-pointer rounded-tl-md border-r p-4 text-center font-semibold transition hover:opacity-80 ${
              selectedExtraPanel === "tasks"
                ? "bg-jpurple text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setSelectedExtraPanel("tasks")}
          >
            Ver Tarefas
          </div>
          <div
            className={`cursor-pointer border-r p-4 text-center font-semibold transition hover:opacity-80 ${
              selectedExtraPanel === "tickets"
                ? "bg-jpurple text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setSelectedExtraPanel("tickets")}
          >
            Ver Tickets
          </div>
          <div
            className={` cursor-pointer rounded-tr-md border-r p-4 text-center font-semibold transition hover:opacity-80 ${
              selectedExtraPanel === "quotes"
                ? "bg-jpurple text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setSelectedExtraPanel("quotes")}
          >
            Ver Orçamentos
          </div>
        </div>

        {selectedExtraPanel === "tasks" && (
          <div className="mt-6 mb-12 grid  grid-cols-1 gap-5 p-4 xl:grid-cols-2 2xl:grid-cols-3">
            {tasksDisplay}
          </div>
        )}

        {selectedExtraPanel === "quotes" && (
          <div className="mt-6 mb-12 flex flex-col gap-2 p-4">
            <table
              className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll rounded-md  border p-2 "
              id="quote-table"
            >
              <thead className="overflow-hidden rounded-t-md  bg-gray-300 text-gray-600">
                <tr className="rounded-md">
                  <th className="cursor-pointer rounded-tl-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Data
                  </th>
                  <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Lead
                  </th>
                  <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Valor
                  </th>
                  <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Usuário
                  </th>
                  <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Concluído?
                  </th>

                  <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Tags
                  </th>
                  <th className="cursor-pointer rounded-tr-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody id="quote-table-body" className="border border-gray-400">
                {quotesDisplay}
              </tbody>
            </table>
          </div>
        )}

        {selectedExtraPanel === "tickets" && (
          <div className="mt-6 mb-12 flex flex-col gap-2 p-4">
            <table
              className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll rounded-md  border p-2 "
              id="ticket-table"
            >
              <thead className="overflow-hidden rounded-t-md  bg-gray-300 text-gray-600">
                <tr className="rounded-md">
                  <th className="cursor-pointer rounded-tl-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Data
                  </th>
                  <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Lead
                  </th>
                  <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Valor
                  </th>
                  <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Usuário
                  </th>

                  <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Tags
                  </th>
                  <th className="cursor-pointer rounded-tr-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody id="ticket-table-body" className="border border-gray-400">
                {ticketsDisplay}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default EditLeadPanel;
