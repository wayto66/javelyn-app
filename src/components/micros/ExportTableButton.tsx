import { IconDownload, IconTableExport } from "@tabler/icons-react";
import handleSheetWrite from "~/helpers/handleSheetWrite";

export const ExportTableButton = () => {
  return (
    <div
      className="group ml-auto flex cursor-pointer flex-row items-center gap-2 rounded-md border-b px-5 py-2 text-jpurple shadow-xl hover:border-b hover:border-jpurple hover:opacity-70 "
      onClick={handleSheetWrite}
    >
      <IconTableExport className="transition group-hover:animate-pulse" />
      <span className="text-sm font-bold transition ">Exportar Planilha</span>
    </div>
  );
};
