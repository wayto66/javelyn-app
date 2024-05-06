import { env } from "process";
import { MouseEvent, useContext, useState } from "react";
import { toast } from "react-toastify";
import fetchMultiform from "~/helpers/fetchMultiform";
import { reactContext } from "~/pages/_app";

type MessageConfirmationModalParams = {
  closeModal: () => void;
  onSubmit: (e: any) => Promise<void>;
  previewMessage: string;
};

export const MessageConfirmationModal = ({
  closeModal,
  onSubmit,
  previewMessage,
}: MessageConfirmationModalParams) => {
  const ctx = useContext(reactContext);

  const handleCloseModal = (e: MouseEvent) => {
    if ((e.target as HTMLElement).id !== "message-confirm-modal-container")
      return;
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 flex hidden h-screen w-screen flex-col items-center justify-center overflow-auto bg-black/40 backdrop-blur-[1px]"
      id="message-confirm-modal-container"
      onClick={handleCloseModal}
    >
      <div className="mx-auto flex max-w-[66vw] flex-col gap-6 rounded-md bg-white p-6 shadow-xl">
        <span className="w-max border-b border-cyan-600 font-bold">
          Verifique como ficará a mensagem a ser enviada:
        </span>
        <div className="rounded-md border p-2">{previewMessage}</div>
        <button
          className="rounded-md bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue] px-2 py-1 font-extrabold uppercase text-white transition hover:scale-[1.03] active:scale-[0.96] "
          onClick={onSubmit}
        >
          Confirmar Envio
        </button>
      </div>
    </div>
  );
};
