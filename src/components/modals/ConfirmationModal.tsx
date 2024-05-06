import { MouseEvent, useContext } from "react";
import { reactContext } from "~/pages/_app";

const ConfirmationModal = () => {
  const { data, setData } = useContext(reactContext);

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "confirmation-modal-overlay") {
      setData((prev) => {
        return {
          ...prev,
          confirmationModalData: {
            visible: false,
          },
        };
      });
    }
  };
  return (
    <>
      <div
        className="fixed inset-0 z-[998] flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]"
        id="confirmation-modal-overlay"
        onClick={handleOverlayClick}
      >
        <div className="flex flex-col overflow-hidden rounded-md bg-white">
          <div className="h-2 w-full bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue]"></div>
          <div className="p-4"> {data.confirmationModalData.message}</div>
          <div className="grid w-full grid-cols-2 gap-4 p-4">
            <button
              className="rounded-md bg-gray-400 bg-gradient-to-r px-2 py-1 font-bold uppercase text-white transition hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                setData((prev) => {
                  return {
                    ...prev,
                    confirmationModalData: {
                      visible: false,
                    },
                  };
                });
              }}
            >
              Cancelar
            </button>
            <button
              className="rounded-md bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue] px-2 py-1 font-bold uppercase text-white transition hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                if (!data.confirmationModalData.action) return;
                data.confirmationModalData.action();
                setData((prev) => {
                  return {
                    ...prev,
                    confirmationModalData: {
                      visible: false,
                    },
                  };
                });
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
