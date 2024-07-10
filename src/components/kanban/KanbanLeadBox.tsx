import {
  IconInfoCircle,
  IconEdit,
  IconTrash,
  IconBrandWhatsapp,
  IconDragDrop,
  IconPhone,
  IconMail,
  IconCheck,
  IconX,
  IconStarFilled,
} from "@tabler/icons-react";
import { DraggableProvided } from "react-beautiful-dnd";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { AtributeType, AtributeValueType, Lead, Tag } from "~/types/graphql";
import { Tooltip } from "react-tooltip";
import { useContext } from "react";
import { reactContext } from "~/pages/_app";

export interface IKanbanLeadBoxParams {
  lead: Lead;
  provided: DraggableProvided;
  handleEdit: (lead: Lead) => void;
  handleRemove: (lead: Lead) => void;
}

export const KanbanLeadBox = ({
  lead,
  provided,
  handleEdit,
  handleRemove,
}: IKanbanLeadBoxParams) => {
  const ctx = useContext(reactContext);
  const attributes = ctx.data.attributes?.filter((attr) =>
    attr.types.includes(AtributeType.LEAD)
  );
  const fieldsToShow = ctx.data.kanbanFieldsToShow;
  const customFields =
    typeof fieldsToShow.customFields === "boolean"
      ? {}
      : fieldsToShow.customFields ?? {};

  const handleWpp = () => {
    window.open(`https://wa.me/${lead.phone}`, "_blank");
  };

  const tagsDisplay = lead.tags?.map((tag, id) => {
    const tags = lead.tags as Tag[];
    if (!tag || id > 3) return null;
    if (id === 3 && tags?.length > 4)
      return (
        <button
          type="button"
          className={`rounded-md bg-gray-300 px-3 py-1 text-xs font-semibold text-black transition hover:opacity-80`}
          key={`lead-tag-${tag.id}`}
        >
          + {tags.length - 3} tags
        </button>
      );
    return (
      <button
        type="button"
        data-value={tag.id}
        className={`rounded-md px-3 py-1 text-xs font-semibold transition hover:opacity-80`}
        style={{
          backgroundColor: tag.colorHex,
          color: getOptimalTextColor(tag.colorHex),
        }}
        key={`lead-tag-${tag.id}`}
      >
        {tag.name}
      </button>
    );
  });
  return (
    <div className="flex max-w-[350px] cursor-pointer flex-col rounded-md border bg-white p-4 text-sm font-semibold tracking-tight text-gray-800 shadow-xl">
      <div className="text-lgitems-center flex flex-row justify-between gap-2 font-bold">
        {lead.name}
        <IconInfoCircle
          size={15}
          data-tooltip-id={`tooltip-lead-${lead.id}`}
          data-tooltip-content={
            lead.observation ?? "Nenhuma observação anotada"
          }
        />
        <Tooltip id={`tooltip-lead-${lead.id}`} className="z-[99]" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {fieldsToShow.CPF && (
          <div className="flex items-center gap-1 ">
            <div className="w-[25px] text-xs font-bold tracking-tighter text-gray-400">
              CPF
            </div>
            {lead.CPF ?? "?"}
          </div>
        )}
        {fieldsToShow.phone && (
          <div className="flex items-center gap-1 ">
            <div className="w-[25px] text-xs font-bold tracking-tighter text-gray-400">
              <IconPhone size={15} />
            </div>
            {lead.phone ?? "?"}
          </div>
        )}
        {fieldsToShow.mail && (
          <div className="flex items-center gap-1 ">
            <div className="w-[25px] text-xs font-bold tracking-tighter text-gray-400">
              <IconMail size={15} />
            </div>
            {lead.mail ?? "?"}
          </div>
        )}
        {Object.entries(customFields)
          .filter(([key, value]) => value !== false)
          .map(([key, value]) => {
            if (!lead.customFields)
              return (
                <div
                  className="flex items-center gap-1 "
                  key={`lead-line-attr-${key}`}
                ></div>
              );

            const attribute = attributes?.find((attr) => attr.name === key);
            if (!attribute)
              return (
                <div
                  className="flex items-center gap-1 "
                  key={`lead-line-attr-${key}`}
                >
                  <div className="w-[25px] text-xs font-bold tracking-tighter text-gray-400">
                    <IconStarFilled size={15} />
                  </div>
                  {lead.customFields ? lead.customFields[key] ?? "?" : "?"}
                </div>
              );

            const valueType = attribute.valueType;
            if (valueType === AtributeValueType.BOOLEAN) {
              let display = <></>;
              const value = lead.customFields[key];
              if (value === "0")
                display = <IconX className="w-full bg-red-400 text-white" />;
              if (value === "2")
                display = (
                  <IconCheck className="w-full bg-emerald-400 text-white" />
                );
              return (
                <div
                  className="flex items-center gap-3 text-xs font-bold tracking-tighter text-gray-500"
                  key={`lead-line-${lead.id}-attr-${key}`}
                >
                  <div className=""> {key}:</div>
                  {display}
                </div>
              );
            }

            return (
              <div
                className="flex items-center gap-1 "
                key={`lead-line-attr-${key}`}
              >
                <div className="w-[25px] text-xs font-bold tracking-tighter text-gray-400">
                  <IconStarFilled size={15} />
                </div>
                {lead.customFields ? lead.customFields[key] ?? "?" : "?"}
              </div>
            );
          })}
      </div>
      {fieldsToShow.tags && (
        <div className="mt-3 flex min-h-[25px] flex-wrap gap-1">
          {tagsDisplay}
        </div>
      )}
      <div className="mt-6 flex flex-row gap-1">
        <IconEdit
          onClick={() => handleEdit(lead)}
          className="transition hover:text-jpurple"
        />
        <IconTrash
          onClick={() => handleRemove(lead)}
          className="transition hover:text-jpurple"
        />
        <IconBrandWhatsapp
          onClick={handleWpp}
          className="transition hover:text-jpurple"
        />
        <div
          {...provided.dragHandleProps}
          className="drag-handle ml-auto cursor-move "
          style={{ cursor: "grab" }}
        >
          <IconDragDrop className="opacity-30" />
        </div>
      </div>
    </div>
  );
};
