import { IconEdit, IconTrash, IconRestore } from "@tabler/icons-react";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { Quote, Tag } from "~/types/graphql";

export type TQuoteTableLine = {
  quote: Quote;
  handleEdit: (quote: Quote) => void;
  handleRemove?: (quote: Quote) => void;
  handleRestore?: (quote: Quote) => void;
};

export const QuoteTableLine = ({
  quote,
  handleEdit,
  handleRemove,
  handleRestore,
}: TQuoteTableLine) => {
  return (
    <tr
      className={`${
        quote.isActive ? "bg-violet-50" : "bg-red-400"
      } py-1 transition hover:bg-gray-300`}
      style={{ backgroundColor: quote.handledAt ? "rgb(177,245,166)" : "" }}
    >
      <td
        className="cursor-pointer px-2 text-sm transition hover:font-semibold hover:text-jpurple"
        onClick={() => handleEdit(quote)}
      >
        {new Date(quote.createdAt).toLocaleString("pt-BR")}
      </td>
      <td className="px-2 text-sm">{quote.lead?.name}</td>
      <td className="px-2 ">{quote.value.toLocaleString("pt-BR")}</td>
      <td className="px-2">{quote.user?.name}</td>
      <td className="px-2">{quote.handledAt ? "SIM" : "NÃO"}</td>

      <td className=" px-2">
        <div className="grid grid-cols-4 gap-1">
          {quote.tags?.map((tag, id) => {
            const tags = quote.tags as Tag[];
            if (!tag || id > 3) return null;
            if (id === 3 && tags?.length > 4)
              return (
                <button
                  type="button"
                  className={`rounded-md bg-gray-300 px-3 py-1 text-xs font-semibold text-black transition hover:opacity-80`}
                  key={`quote-tag-${tag.id}`}
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
                key={`quote-tag-${tag.id}`}
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
          onClick={() => handleEdit(quote)}
        />
        {handleRemove &&
          handleRestore &&
          (quote.isActive ? (
            <IconTrash
              className="cursor-pointer select-none transition hover:bg-gray-400"
              onClick={() => handleRemove(quote)}
            />
          ) : (
            <IconRestore
              className="cursor-pointer select-none transition hover:bg-gray-400"
              onClick={() => handleRestore(quote)}
            />
          ))}
      </td>
    </tr>
  );
};
