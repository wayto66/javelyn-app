import {
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { sheetToJson } from "~/helpers/sheetToJson";
import { ShineButton } from "../micros/ShineButton";
import PurpleButton from "../micros/PurpleButton";
import { AtributeType, CreateLeadInput, LeadStatus } from "~/types/graphql";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { arrayToGraphQLString } from "~/helpers/arrayToGraphQLString";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import {
  DropResult,
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import { KanbanLeadBox } from "../kanban/KanbanLeadBox";
import {
  IconDeviceFloppy,
  IconDragDrop,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { color } from "html2canvas/dist/types/css/types/color";
import { Toggle } from "../micros/Toggle";

export interface IColumnReorderModalParams {
  closeColumnReorderModal: () => void;
  isColumnReorderModalVisible: boolean;
  statuses: LeadStatus[];
  setStatuses: Dispatch<SetStateAction<LeadStatus[]>>;
}

export interface IFieldsFormParams {
  CPF: boolean;
  name: boolean;
  mail: boolean;
  phone: boolean;
  customFields: Record<string, boolean>;
  tags: boolean;
  date: boolean;
  status: boolean;
}

export const KanbanColumnReorderModal = ({
  closeColumnReorderModal,
  isColumnReorderModalVisible,
  statuses: importedStatuses,
  setStatuses: setImportedStatuses,
}: IColumnReorderModalParams) => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);

  const [statuses, setStatuses] = useState<LeadStatus[]>(importedStatuses);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const updatedStatuses = Array.from(statuses);
    const targetStatusIndex = updatedStatuses.findIndex(
      (status) => status.id === parseInt(draggableId)
    );
    const [movedStatus] = updatedStatuses.splice(targetStatusIndex, 1);

    if (!movedStatus) return;

    let newStatus = statuses.find(
      (status) => status.id === parseInt(destination.droppableId)
    );

    const newLead = {
      ...movedStatus,
      status: newStatus,
    };

    updatedStatuses.splice(destination.index, 0, newLead);
    setStatuses(updatedStatuses);
  };

  const save = async () => {
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      if (!status) continue;

      const response = await fetchData({
        mutation: `
        mutation {
        updateLeadStatus(updateLeadStatusInput: {
        id: ${status.id}
        sortIndex: ${i}
        }) { id }
        }
      `,
        token: session?.user.accessToken ?? "",
        ctx,
      });

      if (!response) toast.error("Houve um erro ao atualizar o status.");
    }

    setImportedStatuses(statuses);
    closeColumnReorderModal();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex  h-screen w-screen items-center justify-center bg-black/50 backdrop-blur"
      id="sheet-import-modal-backdrop"
    >
      <div className="flex flex-col  rounded-md bg-white p-6">
        <div className="mb-4 flex items-center gap-1 font-semibold tracking-tight text-gray-500">
          <IconInfoCircle size={15} /> Arraste os itens para ordenar as colunas
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={"0"} key={0}>
            {(provided, snapshot) => (
              <div
                className="flex flex-col "
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <div className="flex flex-col gap-4 overflow-hidden p-2">
                  {statuses.map((status, index) => (
                    <Draggable
                      key={status.id}
                      draggableId={status.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <KanbanStatusBox {...status} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-12 flex w-full flex-row justify-between gap-4">
          <PurpleButton
            className="flex items-center gap-2"
            onClick={closeColumnReorderModal}
          >
            <IconX />
            Cancelar
          </PurpleButton>
          <PurpleButton className="flex items-center gap-2" onClick={save}>
            <IconDeviceFloppy />
            Salvar
          </PurpleButton>
        </div>
      </div>
    </div>
  );
};

const KanbanStatusBox = (status: LeadStatus) => {
  return (
    <div
      className="flex flex-row items-center justify-between gap-6 rounded-md p-6 text-white shadow-xl"
      style={{ backgroundColor: status.color }}
    >
      <div className="">{status.name}</div>
      <IconDragDrop className="opacity-50" />
    </div>
  );
};
