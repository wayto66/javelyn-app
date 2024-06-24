import {
  IconEdit,
  IconTrash,
  IconRestore,
  IconQuestionMark,
  IconX,
  IconCheck,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { useContext, useMemo } from "react";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { triStateDisplay } from "~/helpers/triStateDisplay";
import { reactContext } from "~/pages/_app";
import { AtributeType, AtributeValueType, Lead, Tag } from "~/types/graphql";

export type TLeadTableLine = {
  lead: Lead;
  handleEdit?: (lead: Lead) => void;
  handleRemove?: (lead: Lead) => void;
  handleRestore?: (lead: Lead) => void;
  fieldsToShow: Record<string, boolean | Record<string, boolean>>;
};

export const LeadTableLine = ({
  lead,
  handleEdit,
  handleRemove,
  handleRestore,
  fieldsToShow,
}: TLeadTableLine) => {
  const ctx = useContext(reactContext);
  const attributes = ctx.data.attributes?.filter((attr) =>
    attr.types.includes(AtributeType.LEAD)
  );
  const editLead = () => {
    if (!handleEdit) return;
    handleEdit(lead);
  };
  const removeLead = () => {
    if (!handleRemove) return;
    handleRemove(lead);
  };
  const restoreLead = () => {
    if (!handleRestore) return;
    handleRestore(lead);
  };

  const whatsapp = () => {
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

  const customFields =
    typeof fieldsToShow.customFields === "boolean"
      ? {}
      : fieldsToShow.customFields ?? {};
  return (
    <tr
      className={`${
        lead.isActive ? "bg-violet-100" : "bg-red-400"
      }  py-1 transition hover:bg-gray-300 `}
      key={`lead-tr-${lead.id}-${Math.random()}`}
    >
      {fieldsToShow.date && (
        <td
          className="cursor-pointer px-2 text-sm transition  hover:text-jpurple"
          onClick={() => editLead()}
        >
          {new Date(lead.createdAt).toLocaleString("pt-BR")}
        </td>
      )}
      <td
        className="cursor-pointer px-2 text-sm font-semibold transition  hover:text-jpurple"
        onClick={() => editLead()}
      >
        {lead.name}
      </td>
      {fieldsToShow.CPF && <td className="px-2 ">{lead.CPF}</td>}
      {fieldsToShow.phone && <td className="px-2">{lead.phone}</td>}
      {fieldsToShow.mail && <td className="px-2">{lead.mail}</td>}

      {fieldsToShow.tags && (
        <td className=" px-2">
          <div className="grid grid-cols-4 gap-1">{tagsDisplay}</div>
        </td>
      )}

      {Object.entries(customFields)
        .filter(([key, value]) => value !== false)
        .map(([key, value]) => {
          if (!lead.customFields)
            return <td className="px-2" key={`lead-line-attr-${key}`}></td>;

          const attribute = attributes?.find((attr) => attr.name === key);
          if (!attribute)
            return (
              <td className="px-2" key={`lead-line-attr-${key}`}>
                {lead.customFields ? lead.customFields[key] : ""}
              </td>
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
              <td className="" key={`lead-line-${lead.id}-attr-${key}`}>
                {display}
              </td>
            );
          }

          return (
            <td className="px-2" key={`lead-line-attr-${key}`}>
              {lead.customFields ? lead.customFields[key] : ""}
            </td>
          );
        })}

      <td className="my-auto flex h-full flex-row items-center gap-2 px-2 font-normal text-gray-500">
        <IconEdit
          className="cursor-pointer select-none transition hover:bg-gray-400"
          onClick={() => editLead()}
        />
        {lead.isActive ? (
          <IconTrash
            className="cursor-pointer select-none transition hover:bg-gray-400"
            onClick={() => removeLead()}
          />
        ) : (
          <IconRestore
            className="cursor-pointer select-none transition hover:bg-gray-400"
            onClick={() => restoreLead()}
          />
        )}
        {lead.phone && (
          <IconBrandWhatsapp
            className="cursor-pointer select-none transition hover:bg-gray-400"
            onClick={whatsapp}
          />
        )}
      </td>
    </tr>
  );
};
