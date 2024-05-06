import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Attribute } from "~/types/graphql";
import { Toggle } from "./Toggle";
import { TriToggle } from "./TriToggle";

type TextCustomFilterParams = {
  attribute: Attribute;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
};

export const TextCustomFilter = ({
  attribute,
  register,
  watch,
}: TextCustomFilterParams) => {
  return (
    <div className="flex flex-col">
      <span className="text-center ">{attribute.name}</span>
      <input
        type="text"
        className=" w-full rounded-md border border-slate-300 px-6 py-2"
        {...register(attribute.name)}
      />
    </div>
  );
};
