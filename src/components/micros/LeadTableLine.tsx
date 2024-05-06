import { IconEdit, IconTrash, IconRestore } from "@tabler/icons-react";
import { useMemo } from "react";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { triStateDisplay } from "~/helpers/triStateDisplay";
import { Lead, Tag } from "~/types/graphql";

export type TLeadTableLine = {
  lead: Lead;
  handleEdit?: (lead: Lead) => void;
  handleRemove?: (lead: Lead) => void;
  handleRestore?: (lead: Lead) => void;
};

export const LeadTableLine = ({
  lead,
  handleEdit,
  handleRemove,
  handleRestore,
}: TLeadTableLine) => {
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
    <tr
      className={`${
        lead.isActive ? "bg-violet-50" : "bg-red-400"
      } py-1 transition hover:bg-gray-300`}
      key={`lead-tr-${lead.id}-${Math.random()}`}
    >
      <td
        className="cursor-pointer px-2 text-sm transition  hover:text-jpurple"
        onClick={() => editLead()}
      >
        {new Date(lead.createdAt).toLocaleString("pt-BR")}
      </td>
      <td
        className="cursor-pointer px-2 text-sm transition  hover:text-jpurple"
        onClick={() => editLead()}
      >
        {lead.name}
      </td>
      <td className="px-2 ">{lead.CPF}</td>
      <td className="px-2">{lead.phone}</td>

      <td className=" px-2">
        <div className="grid grid-cols-4 gap-1">{tagsDisplay}</div>
      </td>

      <td className="flex flex-row gap-2 px-2 font-normal text-gray-500">
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
      </td>
    </tr>
  );
};
