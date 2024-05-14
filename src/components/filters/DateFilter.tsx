import { useEffect } from "react";
import { UseFormSetValue, useForm } from "react-hook-form";

import { AppFilterInput } from "~/types/AppFiltersInput";

const indexMonthNameMap = new Map<number, string>([
  [0, "JANEIRO"],
  [1, "FEVEREIRO"],
  [2, "MARÇO"],
  [3, "ABRIL"],
  [4, "MAIO"],
  [5, "JUNHO"],
  [6, "JULHO"],
  [7, "AGOSTO"],
  [8, "SETEMBRO"],
  [9, "OUTUBRO"],
  [10, "NOVEMBRO"],
  [11, "DEZEMBRO"],
]);

type TDateFilterParams = {
  setValue: UseFormSetValue<AppFilterInput>;
  filters: AppFilterInput;
};

type DateFilterForm = {
  day: string;
  monthYear: string;
  dateFrom: string;
  dateTo: string;
};

export const DateFilter = ({ setValue, filters }: TDateFilterParams) => {
  const today = new Date();

  const {
    register,
    setValue: setLocalValue,
    watch,
    getValues,
    resetField,
  } = useForm<DateFilterForm>({
    defaultValues: {
      dateFrom: filters.createdAt?.gt?.split("T")[0] ?? undefined,
      dateTo: filters.createdAt?.lt?.split("T")[0] ?? undefined,
    },
  });

  const monthOptions = () => {
    const currentMonth = today.getMonth();
    const options = [];

    for (let i = 0; i < 13; i++) {
      const date = new Date();
      date.setMonth(currentMonth - i);
      const month = date.getMonth();
      const monthName = indexMonthNameMap.get(month);
      const year = date.getFullYear();
      options.push(
        <option key={`month-${month}-${year}`} value={`${month}-${year}`}>
          {monthName} - {year}
        </option>
      );
    }

    return options;
  };

  useEffect(() => {
    const { dateFrom, dateTo } = getValues();
    if (!dateFrom && !dateTo) return;
    resetField("day");
    resetField("monthYear");
    setValue("createdAt.gt", getValues("dateFrom") + "T00:00:00.000Z");
    setValue("createdAt.lt", getValues("dateTo") + "T00:00:00.000Z");
  }, [watch("dateFrom"), watch("dateTo")]);

  useEffect(() => {
    const { day, monthYear } = getValues();
    if (!day && !monthYear) return;
    resetField("dateFrom");
    resetField("dateTo");
    ///
    if (day && !monthYear) return;
    if (!day && monthYear) {
      const [month, year] = monthYear.split("-");
      console.log({ month, year });
      if (isNaN(Number(month)) || isNaN(Number(year))) return;
      const dateGT = new Date(Number(year), Number(month), 1, 0, 0, 0);
      console.log(dateGT);
      const dateLT = new Date(Number(year), Number(month), 1, 0, 0, 0);
      dateLT.setMonth(dateLT.getMonth() + 1);
      console.log(dateLT);
      setValue("createdAt.gt", dateGT.toISOString());
      setValue("createdAt.lt", dateLT.toISOString());
    } else {
      const [month, year] = monthYear.split("-");
      console.log({ month, year });
      if (isNaN(Number(month)) || isNaN(Number(year))) return;
      const dateGT = new Date(
        Number(year),
        Number(month),
        Number(day),
        0,
        0,
        0
      );
      console.log(dateGT);
      const dateLT = new Date(
        Number(year),
        Number(month),
        Number(day),
        23,
        59,
        59
      );
      console.log(dateLT);
      setValue("createdAt.gt", dateGT.toISOString());
      setValue("createdAt.lt", dateLT.toISOString());
    }
  }, [watch("day"), watch("monthYear")]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-1">
      <div className="mr-auto text-sm text-slate-700">Data</div>
      <div className="relative grid  w-full grid-cols-4 items-end justify-around gap-6 rounded-md border p-2">
        <div className="flex flex-col">
          <label className="text-sm ">Visualizar por dia:</label>
          <select
            className="rounded-md bg-jpurple p-2 text-white"
            {...register("day")}
          >
            {[
              undefined,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
            ].map((value) => {
              return (
                <option
                  value={value}
                  key={`day-option-${value}`}
                  className="text-white"
                >
                  {value}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm " htmlFor="meses">
            Visualizar por mês:
          </label>
          <select
            className="rounded-md bg-jpurple p-2 text-white"
            {...register("monthYear")}
          >
            <option key="empty-month-option"></option>
            {monthOptions()}
          </select>
        </div>
        <div className="col-span-2 flex flex-col rounded-md  ">
          <div className="flex flex-row items-center justify-center gap-4">
            <label
              className="mb-1 border-b border-jpurple text-sm"
              htmlFor="meses"
            >
              Data personalizada
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs">De:</span>
              <input
                id="customDateFrom"
                type="date"
                className="rounded-md bg-jpurple p-2 text-white"
                {...register("dateFrom")}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs">Até:</span>
              <input
                id="customDateTo"
                type="date"
                className="rounded-md bg-jpurple p-2 text-white"
                {...register("dateTo")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
