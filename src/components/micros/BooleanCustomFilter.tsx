import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Attribute } from "~/types/graphql";
import { Toggle } from "./Toggle";
import { TriToggle } from "./TriToggle";

type BooleanCustomFilterParams = {
  attribute: Attribute;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
};

export const BooleanCustomFilter = ({
  attribute,
  register,
  watch,
}: BooleanCustomFilterParams) => {
  return (
    <div className="flex flex-col">
      <span className="text-center ">{attribute.name}</span>
      <TriToggle parameter={attribute.name} register={register} watch={watch} />
    </div>
  );
};
