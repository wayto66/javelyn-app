import { IconEdit, IconTrash, IconRestore } from "@tabler/icons-react";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { Ticket, Tag } from "~/types/graphql";

export type TTicketTableLine = {
  ticket: Ticket;
  handleEdit: (ticket: Ticket) => void;
  handleRemove?: (ticket: Ticket) => void;
  handleRestore?: (ticket: Ticket) => void;
};

export const TicketTableLine = ({
  ticket,
  handleEdit,
  handleRemove,
  handleRestore,
}: TTicketTableLine) => {
  return (
    <tr
      className={`${
        ticket.isActive ? "bg-violet-50" : "bg-red-400"
      } py-1 transition hover:bg-gray-300`}
    >
      <td
        className="cursor-pointer px-2 text-sm transition  hover:text-jpurple"
        onClick={() => handleEdit(ticket)}
      >
        {new Date(ticket.createdAt).toLocaleString("pt-BR")}
      </td>
      <td
        className="cursor-pointer px-2 text-sm transition  hover:text-jpurple"
        onClick={() => handleEdit(ticket)}
      >
        {ticket.lead?.name}
      </td>
      <td className="px-2 ">{ticket.value}</td>
      <td className="px-2">{ticket.user?.name}</td>

      <td className=" px-2">
        <div className="grid grid-cols-4 gap-1">
          {ticket.tags?.map((tag, id) => {
            const tags = ticket.tags as Tag[];
            if (!tag || id > 3) return null;
            if (id === 3 && tags?.length > 4)
              return (
                <button
                  type="button"
                  className={`rounded-md bg-gray-300 px-3 py-1 text-xs font-semibold text-black transition hover:opacity-80`}
                  key={`ticket-tag-${tag.id}`}
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
                key={`ticket-tag-${tag.id}`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </td>
      <td className="flex flex-row gap-2 px-2 font-normal text-gray-500">
        <IconEdit
          className="cursor-pointer select-none transition hover:bg-gray-400"
          onClick={() => handleEdit(ticket)}
        />
        {handleRemove &&
          handleRestore &&
          (ticket.isActive ? (
            <IconTrash
              className="cursor-pointer select-none transition hover:bg-gray-400"
              onClick={() => handleRemove(ticket)}
            />
          ) : (
            <IconRestore
              className="cursor-pointer select-none transition hover:bg-gray-400"
              onClick={() => handleRestore(ticket)}
            />
          ))}
      </td>
    </tr>
  );
};
