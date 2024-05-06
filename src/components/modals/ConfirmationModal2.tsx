import { useEffect } from "react";

type TParams = {
  confirmationModalData: any;
  setConfirmationModalData: any;
};

const ConfirmationModal2 = (data: TParams) => {
  useEffect(() => {
    document.body.onkeyup = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        data.setConfirmationModalData((prev: any) => {
          return { ...prev, show: false };
        });
      }
    };
  });

  return (
    <>
      <div
        className="fixed inset-0 z-[998] flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]"
        id="confirmation-modal"
      >
        <div className="flex flex-col overflow-hidden rounded-md bg-white">
          <div className="h-4 w-full bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue]"></div>
          <div className="p-4 text-center">
            {" "}
            {data.confirmationModalData.message}
          </div>
          <div className="grid w-full grid-cols-3 gap-4 p-4">
            <button
              className="rounded-md bg-gradient-to-r from-gray-500 to-gray-700 px-2 py-1 font-bold uppercase text-white transition hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                data.setConfirmationModalData((prev: any) => {
                  return { ...prev, show: false };
                });
              }}
            >
              Cancelar
            </button>
            <button
              className="rounded-md bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue] px-2 py-1 font-bold uppercase text-white transition hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                data.confirmationModalData.trigger1();
                data.setConfirmationModalData((prev: any) => {
                  return { ...prev, show: false };
                });
              }}
            >
              Arremessar
            </button>
            <button
              className="rounded-md bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue] px-2 py-1 font-bold uppercase text-white transition hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                data.confirmationModalData.trigger2();
                data.setConfirmationModalData((prev: any) => {
                  return { ...prev, show: false };
                });
              }}
            >
              Listar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal2;
