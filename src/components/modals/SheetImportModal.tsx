import { FormEvent, MouseEvent, useContext } from "react";
import { useForm } from "react-hook-form";
import { sheetToJson } from "~/helpers/sheetToJson";
import { ShineButton } from "../micros/ShineButton";
import PurpleButton from "../micros/PurpleButton";
import { CreateLeadInput } from "~/types/graphql";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { arrayToGraphQLString } from "~/helpers/arrayToGraphQLString";

type SheetImportModalParams = {
  closeSheetImportModal: () => void;
  isSheetImportModalVisible: boolean;
  reloadLeads: () => Promise<void>;
};

export const SheetImportModal = ({
  closeSheetImportModal,
  isSheetImportModalVisible,
  reloadLeads,
}: SheetImportModalParams) => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const { register, getValues } = useForm({
    defaultValues: {
      CPF: "CPF",
      name: "NOME",
      mail: "EMAIL",
      phone: "TELEFONE",
      file: undefined,
    },
  });
  const handleSheetImportClick = (e: MouseEvent) => {
    if ((e.target as HTMLDivElement).id === "sheet-import-modal-backdrop")
      closeSheetImportModal();
  };

  const handleRead = async (e: FormEvent) => {
    e.preventDefault();
    const files = getValues("file");
    if (!files) return;
    const file = files[0];
    if (!file) return;
    const data = await sheetToJson(file);
    if (!data) {
      toast.error("Houve um erro ao ler a planilha.");
      return;
    }
    const { name, CPF, mail, phone } = getValues();
    const leadInputs: CreateLeadInput[] = [];
    for (const leadInput of data) {
      if (!leadInput[name]) continue;
      const newLeadInput: any = {
        companyId: session?.user.companyId,
        userId: session?.user.id,
      };
      newLeadInput.name = leadInput[name];
      if (leadInput[CPF]) newLeadInput.CPF = leadInput[CPF];
      if (leadInput[mail]) newLeadInput.mail = leadInput[mail];
      if (leadInput[phone]) newLeadInput.phone = leadInput[phone];

      leadInputs.push(newLeadInput);
    }

    const leadInputsString = leadInputs
      .map((leadInput) => {
        const { name, CPF, mail, phone } = leadInput;
        return `{
          name: "${name}",
          ${CPF ? `CPF: "${CPF}",` : ""}
          ${mail ? `mail: "${mail}",` : ""}
          ${phone ? `phone: "${phone}",` : ""}
          companyId: ${leadInput.companyId}
          userId: ${leadInput.userId}
        }`;
      })
      .join(",");

    const response = await fetchData({
      mutation: `
        mutation {
        createLeads(createLeadsInput: {
        leads: [${leadInputsString}]
        }) {
          count
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response?.data.createLeads) {
      toast.success("Leads criados com sucesso!");
      reloadLeads();
    } else {
      toast.error("Houve um erro ao criar os leads. ");
    }

    closeSheetImportModal();
  };

  if (!isSheetImportModalVisible) return <></>;
  return (
    <div
      className="fixed inset-0 z-[9999] flex  h-screen w-screen items-center justify-center bg-black/50 backdrop-blur"
      id="sheet-import-modal-backdrop"
      onClick={handleSheetImportClick}
    >
      <form
        className="flex flex-col  rounded-md bg-white p-6"
        onSubmit={handleRead}
      >
        <span className="text-sm text-gray-500">Arquivo da Planilha:</span>
        <input
          className="mt-[-15px] flex h-full items-center justify-center rounded-md bg-jpurple px-5 py-1 text-white transition hover:bg-jpurple/80"
          type="file"
          {...register("file")}
          accept=".xlsx, .xls, .csv, .ods"
        />
        <div className="mt-8">
          Configure as colunas de acordo com os campos à serem cadastrados:
        </div>
        <div className="text-xs text-gray-400">
          Ignore os campos que não forem ser utilizados
        </div>

        <div className="my-12 grid grid-cols-2 gap-3">
          <div className="ml-auto">Nome:</div>
          <input
            type="text"
            className="rounded-md border px-2"
            {...register("name")}
          />
          <div className="ml-auto">CPF:</div>
          <input
            type="text"
            className="rounded-md border px-2"
            {...register("CPF")}
          />
          <div className="ml-auto">Telefone:</div>
          <input
            type="text"
            className="rounded-md border px-2"
            {...register("phone")}
          />
          <div className="ml-auto">E-mail:</div>
          <input
            type="text"
            className="rounded-md border px-2"
            {...register("mail")}
          />
        </div>

        <PurpleButton>Importar</PurpleButton>
      </form>
    </div>
  );
};
