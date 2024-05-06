import React, { useEffect, useMemo, useState } from "react";
import { FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";

type ToggleParams = {
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<any>;
  parameter: string;
};

export const TriToggle = ({ register, parameter, watch }: ToggleParams) => {
  const [_, _rr] = useState(false);
  const render = () => _rr((prev) => !prev);

  const styleValues = useMemo(() => {
    const value = watch(parameter);
    if (value === "0")
      return { left: "0%", backgroundColor: "rgb(248,212,221)" };
    if (value === "2")
      return { left: "calc(100% - 25px)", backgroundColor: "rgb(211,241,211)" };
    return { left: "calc(50% - 12px)", backgroundColor: "rgb(235,235,235)" };
  }, [watch(parameter)]);
  return (
    <div
      className="flex  flex-col items-center justify-center py-2"
      onClick={render}
    >
      <label
        className="relative flex h-6 w-32 cursor-pointer items-center rounded-full bg-gray-300"
        style={{
          backgroundColor: styleValues.backgroundColor,
        }}
      >
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          className="absolute h-full w-full cursor-pointer opacity-0"
          defaultValue={"1"}
          {...register(parameter)}
        />
        <span
          className={`absolute block h-[25px] w-6 rounded-full bg-jpurple shadow-md transition-all duration-200 ease-in-out `}
          style={{ left: styleValues.left }}
        ></span>
      </label>
      <div className="flex w-32 flex-row justify-between px-2 text-sm text-gray-500">
        <span>não</span>
        <span>-</span>
        <span>sim</span>
      </div>
    </div>
  );
};
