import { IconCalendar } from "@tabler/icons-react";
import PurpleButton from "../micros/PurpleButton";
import { MouseEvent } from "react";
import { useForm } from "react-hook-form";

type DateSelectorModalParams = {
  isVisible: boolean;
  handleClose: () => void;
  selectDate: (date: string) => void;
};

export const DateSelectorModal = ({
  isVisible,
  handleClose,
  selectDate,
}: DateSelectorModalParams) => {
  const handleBackdropClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).id === "date-select-backdrop") handleClose();
  };

  const { register, getValues } = useForm();

  const handleSelectDate = () => {
    const { date } = getValues();
    selectDate(date);
  };

  if (!isVisible) return <></>;
  return (
    <div
      className="fixed top-0 left-0 z-[999] flex h-screen w-screen items-center justify-center bg-black/50 backdrop-blur-[1px]"
      id="date-select-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col rounded-md bg-white p-4">
        <div className="flex flex-row items-center justify-between gap-12">
          <IconCalendar />
          <span className="text-sm font-semibold">Selecionar Data</span>
        </div>
        <div className="my-6 w-full">
          <input
            type="date"
            className="rounded-md px-2 py-1"
            {...register("date")}
          />
        </div>
        <PurpleButton onClick={handleSelectDate}>SELECIONAR</PurpleButton>
      </div>
    </div>
  );
};
