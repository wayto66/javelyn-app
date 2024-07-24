import { IconMaximize, IconMinimize, IconPlus } from "@tabler/icons-react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { Lead, LeadStatus, Tag } from "~/types/graphql";
import { reactContext } from "~/pages/_app";
import router from "next/router";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { fetchData } from "~/handlers/fetchData";
import { useSession } from "next-auth/react";
import { LeadFlowChange } from "../panels/lead/LeadFlow";
import { KanbanLeadBox } from "./KanbanLeadBox";

export interface IKanbanBoardParams {
  leads: Lead[] | undefined;
  setLeads: Dispatch<SetStateAction<Lead[] | undefined>>;
  statuses: LeadStatus[];
  setLeadFlowChanges: Dispatch<SetStateAction<Record<number, LeadFlowChange>>>;
}

interface Column extends LeadStatus {
  open: boolean;
  cards: Lead[];
}

export const KanbanBoard = ({
  leads,
  statuses,
  setLeadFlowChanges,
  setLeads,
}: IKanbanBoardParams) => {
  const ctx = useContext(reactContext);
  const { data: session } = useSession();
  const [columns, setColumns] = useState<Column[]>([]);

  const onDragEnd: OnDragEndResponder = (
    result: DropResult,
    provided: ResponderProvided
  ) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const updatedColumns = [...columns];
    const sourceColumn = updatedColumns?.find(
      (col) => col.id === parseInt(source.droppableId)
    );
    const destinationColumn = updatedColumns?.find(
      (col) => col.id === parseInt(destination.droppableId)
    );

    if (!sourceColumn || !destinationColumn) return;
    const movedIndex = sourceColumn.cards.findIndex(
      (lead) => lead.id === parseInt(draggableId)
    );
    const [movedCard] = sourceColumn.cards.splice(movedIndex, 1);
    if (!movedCard) return;
    destinationColumn.cards.splice(destination.index, 0, movedCard);

    const updatedCards: Lead[] = [];

    for (let i = 0; i < destinationColumn.cards.length; i++) {
      const card = destinationColumn.cards[i];
      if (!card) continue;
      const newCard = { ...card };
      newCard.sortIndex = i;
      updatedCards.push(newCard);
    }

    setLeadFlowChanges((prev) => {
      const changes = { ...prev };
      for (const lead of updatedCards) {
        changes[lead.id] = {
          sortIndex: lead.sortIndex,
          statusId: destinationColumn.id ?? null,
        };
      }
      return changes;
    });

    destinationColumn.cards = updatedCards;

    setColumns(updatedColumns);
  };

  const handleLeadEdit = (lead: Lead) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentLeadData: lead,
      };
    });
    handlePanelChange("leads-edit", ctx, router);
  };

  const handleLeadRemove = (lead: Lead) => {
    const removeLead = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeLead (id: ${lead.id}) {
        id
        }
        }
        `,
      });

      if (response) {
        toast.success("Lead desativado com sucesso.");
        setLeads((prev) => {
          if (!prev) return [];
          const _leads = [...prev];
          const index = _leads.findIndex((_lead) => _lead.id === lead.id);
          const _lead = _leads[index];
          if (!_lead) return prev;
          const updatedLead: Lead = { ..._lead, isActive: false };

          _leads[index] = updatedLead;

          return _leads;
        });
      } else toast.error("Houve um erro ao desativar o lead.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja apagar o lead: ${lead.id} ?`,
          action: async () => {
            await removeLead();
          },
          visible: true,
        },
      };
    });
  };

  const toggleColumn = (id: number) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const targetColumn = newColumns.find((col) => col.id === id);
      if (!targetColumn) return newColumns;
      targetColumn.open = !targetColumn.open;
      return newColumns;
    });
  };

  useEffect(() => {
    setColumns(
      [
        {
          id: 0,
          name: "-",
          companyId: 0,
          color: "",
          isActive: true,
          sortIndex: -1,
        },
        ...statuses,
      ].map((status) => {
        return {
          ...status,
          open: false,
          cards:
            status.id === 0
              ? leads?.filter((lead) => lead.status === null) ?? []
              : leads?.filter((lead) => lead.status?.id === status.id) ?? [],
        };
      })
    );
  }, [statuses, leads]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {columns?.map((status, index) => {
        if (status.id === 0)
          return (
            <Droppable droppableId={"0"} key={0}>
              {(provided, snapshot) => (
                <div
                  className="flex min-w-[250px] flex-col border"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <div className="flex w-full flex-row items-center justify-between gap-2 rounded-t-md bg-gray-700 py-2 px-6 text-center font-semibold tracking-tight text-white">
                    <button
                      className="transition hover:bg-gray-200/30 "
                      onClick={() => toggleColumn(0)}
                    >
                      {status?.open ? <IconMinimize /> : <IconMaximize />}
                    </button>
                    -
                  </div>
                  <div className="flex flex-col gap-4 overflow-hidden p-2">
                    {status.cards
                      .filter((lead) => lead.status === null)
                      .sort((a, b) => a.sortIndex - b.sortIndex)
                      .slice(0, status.open ? 99999 : 3)
                      .map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <KanbanLeadBox
                                lead={lead}
                                provided={provided}
                                handleEdit={handleLeadEdit}
                                handleRemove={handleLeadRemove}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {!status.open && status.cards.length > 3 && (
                      <button
                        className="mx-auto flex gap-1 rounded-xl bg-jpurple px-5 py-2 font-semibold text-white transition hover:bg-jpurple/80"
                        onClick={() => toggleColumn(status.id)}
                      >
                        <IconPlus /> Ver Mais
                      </button>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        return (
          <Droppable droppableId={status.id.toString()} key={status.id}>
            {(provided, snapshot) => (
              <div
                className={`flex min-w-[250px] flex-col border`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <div
                  className="sticky top-0 flex w-full flex-row items-center justify-between gap-2 rounded-t-md py-2 px-4 text-center text-sm font-semibold tracking-tight"
                  style={{
                    backgroundColor: status?.color,
                    color: getOptimalTextColor(status?.color),
                  }}
                >
                  <button
                    className="transition hover:bg-gray-200/30 "
                    onClick={() => toggleColumn(status.id)}
                  >
                    {status?.open ? <IconMinimize /> : <IconMaximize />}
                  </button>
                  {status?.name}
                </div>
                <div className="flex flex-col gap-4 overflow-hidden p-2">
                  {status.cards
                    .sort((a, b) => a.sortIndex - b.sortIndex)
                    .slice(0, status.open ? 9999 : 3)
                    .map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanLeadBox
                              lead={lead}
                              provided={provided}
                              handleEdit={handleLeadEdit}
                              handleRemove={handleLeadRemove}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {!status.open && status.cards.length > 3 && (
                    <button
                      className="mx-auto flex gap-1 rounded-xl bg-jpurple px-5 py-2 font-semibold text-white transition hover:bg-jpurple/80"
                      onClick={() => toggleColumn(status.id)}
                    >
                      <IconPlus /> Ver Mais
                    </button>
                  )}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        );
      })}
    </DragDropContext>
  );
};
