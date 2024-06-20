import {
  IconEdit,
  IconTrash,
  IconRestore,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { Quote, Tag } from "~/types/graphql";

export type TQuoteTableLine = {
  quote: Quote;
  handleEdit: (quote: Quote) => void;
  handleRemove?: (quote: Quote) => void;
  handleRestore?: (quote: Quote) => void;
  fieldsToShow: Record<string, boolean | Record<string, boolean>>;
};

export const QuoteTableLine = ({
  quote,
  handleEdit,
  handleRemove,
  handleRestore,
  fieldsToShow,
}: TQuoteTableLine) => {
  const customFields =
    typeof fieldsToShow.customFields === "boolean"
      ? {}
      : fieldsToShow.customFields ?? {};

  const tagsDisplay = quote.tags?.map((tag, id) => {
    const tags = quote.tags as Tag[];
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
        quote.isActive ? "bg-violet-100" : "bg-red-400"
      } py-1 transition hover:bg-gray-300`}
      style={{ backgroundColor: quote.handledAt ? "rgb(215,250,195)" : "" }}
    >
      <td
        className={`px-2 ${quote.handledAt ? "bg-emerald-300" : "bg-red-300"}`}
      >
        {quote.handledAt ? <IconCheck /> : <IconX />}
      </td>
      {fieldsToShow.date && (
        <td
          className="cursor-pointer px-2 text-sm transition  hover:text-jpurple"
          onClick={() => handleEdit(quote)}
        >
          {new Date(quote.createdAt).toLocaleString("pt-BR")}
        </td>
      )}

      <td
        className="cursor-pointer px-2  text-sm hover:text-jpurple"
        onClick={() => handleEdit(quote)}
      >
        {quote.lead?.name}
      </td>
      {fieldsToShow.CPF && <td className="px-2">{quote.lead?.CPF}</td>}
      {fieldsToShow.phone && <td className="px-2">{quote.lead?.phone}</td>}
      {fieldsToShow.mail && <td className="px-2">{quote.lead?.mail}</td>}

      {fieldsToShow.value && (
        <td className="px-2 ">R${quote.value.toLocaleString("pt-BR")}</td>
      )}
      {fieldsToShow.user && <td className="px-2">{quote.user?.name}</td>}

      {fieldsToShow.tags && (
        <td className=" px-2">
          <div className="grid grid-cols-4 gap-1">{tagsDisplay}</div>
        </td>
      )}

      {Object.entries(customFields)
        .filter(([key, value]) => value !== false)
        .map(([key, value]) => (
          <td className="px-2" key={`lead-line-attr-${key}`}>
            {quote.customFields ? quote.customFields[key] : ""}
          </td>
        ))}

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
