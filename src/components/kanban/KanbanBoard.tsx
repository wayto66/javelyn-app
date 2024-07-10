import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBrandWhatsapp,
  IconChevronDown,
  IconDragDrop,
  IconEdit,
  IconInfoCircle,
  IconMaximize,
  IconMinimize,
  IconTrash,
} from "@tabler/icons-react";
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
  OnDragEndResponder,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { Lead, LeadStatus, Tag } from "~/types/graphql";
import { Tooltip } from "react-tooltip";
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
  setChangesMade: Dispatch<SetStateAction<boolean>>;
  setLeadFlowChanges: Dispatch<SetStateAction<LeadFlowChange[]>>;
}

interface IColumnsData {
  [k: number]: {
    open: boolean;
  };
}

export const KanbanBoard = ({
  leads,
  statuses,
  setChangesMade,
  setLeadFlowChanges,
  setLeads,
}: IKanbanBoardParams) => {
  const ctx = useContext(reactContext);
  const { data: session } = useSession();
  const [columnsData, setColumnsData] = useState<IColumnsData>({});

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !leads) return;

    const { source, destination, draggableId } = result;
    const updatedLeads = Array.from(leads);
    const targetLeadIndex = updatedLeads.findIndex(
      (lead) => lead.id === parseInt(draggableId)
    );
    const [movedLead] = updatedLeads.splice(targetLeadIndex, 1);

    if (!movedLead) return;

    let newStatus = statuses.find(
      (status) => status.id === parseInt(destination.droppableId)
    );

    const newLead = {
      ...movedLead,
      status: newStatus,
    };

    updatedLeads.splice(destination.index, 0, newLead);

    setLeads(updatedLeads);
    setChangesMade(true);
    setLeadFlowChanges((prev) => [
      ...prev,
      {
        leadId: movedLead.id,
        statusId: newStatus?.id ?? null,
      },
    ]);
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
    setColumnsData((prev) => {
      console.log({ open: !prev[id]?.open });
      return {
        ...prev,
        [id]: {
          open: !prev[id]?.open,
        },
      };
    });
  };

  useEffect(() => {
    const newColumnsData: IColumnsData = {
      0: {
        open: true,
      },
    };

    for (const status of statuses) {
      newColumnsData[status.id] = {
        open: true,
      };
    }
    setColumnsData(newColumnsData);
  }, [statuses]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {[null, ...statuses].map((status, index) => {
        if (!status)
          return (
            <Droppable droppableId={"0"} key={0}>
              {(provided, snapshot) => (
                <div
                  className="flex flex-col border"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    maxWidth: columnsData[0]?.open ? "999999vh" : "100px",
                    minWidth: columnsData[0]?.open ? "250px" : "100px",
                  }}
                >
                  <div className="flex w-full flex-row items-center justify-between gap-2 rounded-t-md bg-gray-700 py-2 px-6 text-center font-semibold tracking-tight text-white">
                    <button
                      className="transition hover:bg-gray-200/30 "
                      onClick={() => toggleColumn(0)}
                    >
                      {columnsData[0]?.open ? (
                        <IconMinimize />
                      ) : (
                        <IconMaximize />
                      )}
                    </button>
                    -
                  </div>
                  <div
                    className="flex flex-col gap-4 overflow-hidden p-2"
                    style={{
                      maxHeight: columnsData[0]?.open ? "999999vh" : "200px",
                    }}
                  >
                    {columnsData[0]?.open ? (
                      leads
                        ?.filter((lead) => lead.status === null)
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
                        ))
                    ) : (
                      <div className="w-full text-center text-gray-600">
                        {" "}
                        ...{" "}
                      </div>
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
                className={`flex flex-col border `}
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  maxWidth: columnsData[status.id]?.open ? "999999vh" : "100px",
                  minWidth: columnsData[status.id]?.open ? "250px" : "100px",
                }}
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
                    {columnsData[status.id]?.open ? (
                      <IconMinimize />
                    ) : (
                      <IconMaximize />
                    )}
                  </button>
                  {columnsData[status.id]?.open && status?.name}
                </div>
                <div
                  className="flex flex-col gap-4 overflow-hidden p-2"
                  style={{
                    maxHeight: columnsData[status.id]?.open
                      ? "999999vh"
                      : "100px",
                  }}
                >
                  {columnsData[status.id]?.open ? (
                    leads
                      ?.filter((lead) => lead.status?.id === status?.id)
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
                      ))
                  ) : (
                    <div className="w-full text-center text-gray-600">
                      {" "}
                      ...{" "}
                    </div>
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
