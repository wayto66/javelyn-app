import { UseFormRegister, FieldValues, UseFormWatch } from "react-hook-form";
import { Attribute, AtributeValueType, AtributeType } from "~/types/graphql";
import { Toggle } from "../micros/Toggle";
import { useContext, useEffect, useState } from "react";
import { fetchData } from "~/handlers/fetchData";
import { useSession } from "next-auth/react";
import { reactContext } from "~/pages/_app";
import { TriToggle } from "../micros/TriToggle";

const attributeValueTypeToInput = (
  attr: Attribute,
  register: UseFormRegister<FieldValues>,
  watch: UseFormWatch<any>,
  attributeValue: any
) => {
  const parameter = attr.name.replaceAll(" ", "_");
  if (attr.valueType === AtributeValueType.BOOLEAN) {
    return (
      <TriToggle register={register} parameter={parameter} watch={watch} />
    );
  }
  if (attr.valueType === AtributeValueType.STRING) {
    return (
      <input
        type="text"
        className="rounded-md border px-2 py-1"
        defaultValue={attributeValue}
        {...register(parameter)}
      />
    );
  }

  if (attr.valueType === AtributeValueType.NUMBER) {
    return (
      <input
        type="number"
        className="rounded-md border px-2 py-1"
        defaultValue={attributeValue}
        {...register(parameter)}
      />
    );
  }
};

type AttributesDisplayParams = {
  type?: AtributeType;
  attributeValues?: { name: string; value: any }[];
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
};

export const AttributesDisplay = ({
  type,
  register,
  attributeValues,
  watch,
}: AttributesDisplayParams) => {
  const ctx = useContext(reactContext);
  const attributes = ctx.data.attributes ?? [];
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-4 py-6">
      {attributes.map((attr) => {
        if (!type || (attr.types.includes(type) && attr.isActive)) {
          const attributeValue = attributeValues?.find(
            (attrPair) => attrPair.name === attr.name.replaceAll(" ", "_")
          )?.value;
          return (
            <div
              className="flex flex-col items-start justify-start"
              key={`attribute-item-${attr.id}`}
            >
              <div className="text-start text-sm text-gray-500">
                {attr.name}
              </div>
              {attributeValueTypeToInput(attr, register, watch, attributeValue)}
            </div>
          );
        }
      })}
    </div>
  );
};
