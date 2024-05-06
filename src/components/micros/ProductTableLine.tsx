import { IconEdit, IconTrash, IconRestore } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { Product, Tag } from "~/types/graphql";

export type TProductTableLine = {
  product: Product;
  isSelected: boolean;
  handleEdit: (product: Product) => void;
  handleRemove: (product: Product) => void;
  handleRestore: (product: Product) => void;
  handleSelect: (product: Product, selected: boolean) => void;
};

export const ProductTableLine = ({
  product,
  handleEdit,
  handleRemove,
  handleRestore,
  handleSelect,
  isSelected,
}: TProductTableLine) => {
  const selectItem = () => {
    if (isSelected) handleSelect(product, false);
    else handleSelect(product, true);
  };

  const lineColor = useMemo(() => {
    if (isSelected) return "bg-blue-300";
    if (product.isActive) return "bg-violet-50";
    return "bg-red-500";
  }, [product, isSelected]);
  return (
    <tr className={` py-1 transition hover:bg-gray-300 ${lineColor}`}>
      {/* <td className="">
        <div
          className="mx-auto h-5 w-5 cursor-pointer rounded-sm border-[2px] "
          style={{
            backgroundColor: isSelected ? "#0071ce" : "#b6b6b6",
            borderColor: isSelected ? "#b2b2b2" : "#b2b2b2",
          }}
          onClick={selectItem}
        ></div>
      </td> */}
      <td
        className="cursor-pointer px-2 transition  hover:text-jpurple"
        onClick={() => handleEdit(product)}
      >
        {product.name}
      </td>
      <td className="px-2">{product.sku}</td>
      <td className="px-2 text-xs">{product.category?.name}</td>
      <td className="px-2">{product.value?.toLocaleString("pt-BR")}</td>

      <td className=" px-2">
        <div className="grid grid-cols-4 gap-1">
          {product.tags?.map((tag, id) => {
            const tags = product.tags as Tag[];
            if (!tag || id > 3) return null;
            if (id === 3 && tags?.length > 4)
              return (
                <button
                  type="button"
                  className={`rounded-md bg-gray-300 px-3 py-1 text-xs font-semibold text-black transition hover:opacity-80`}
                  key={`product-tag-${tag.id}`}
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
                key={`product-tag-${tag.id}`}
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
          onClick={() => handleEdit(product)}
        />
        {product.isActive ? (
          <IconTrash
            className="cursor-pointer select-none transition hover:bg-gray-400"
            onClick={() => handleRemove(product)}
          />
        ) : (
          <IconRestore
            className="cursor-pointer select-none transition hover:bg-gray-400"
            onClick={() => handleRestore(product)}
          />
        )}
      </td>
    </tr>
  );
};
