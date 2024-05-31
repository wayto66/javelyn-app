import { IconDownload } from "@tabler/icons-react";
import handleSheetWrite from "~/helpers/handleSheetWrite";

export const ExportTableButton = () => {
  // const _PROVISORYDISABLE = true;
  // if (_PROVISORYDISABLE) return <></>;
  return (
    <div
      className="group ml-auto flex cursor-pointer flex-row items-center gap-2 rounded-md border-b px-5 py-2 text-jpurple shadow-xl "
      onClick={handleSheetWrite}
    >
      <IconDownload className="transition group-hover:animate-pulse" />
      <span className="text-sm font-semibold transition group-hover:underline">
        Exportar Resultados
      </span>
    </div>
  );
};
