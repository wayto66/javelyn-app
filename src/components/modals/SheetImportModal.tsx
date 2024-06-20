import { FormEvent, MouseEvent, useContext, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { sheetToJson } from "~/helpers/sheetToJson";
import { ShineButton } from "../micros/ShineButton";
import PurpleButton from "../micros/PurpleButton";
import { AtributeType, CreateLeadInput } from "~/types/graphql";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { arrayToGraphQLString } from "~/helpers/arrayToGraphQLString";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";

type SheetImportModalParams = {
  closeSheetImportModal: () => void;
  reloadLeads: () => Promise<void>;
};

export interface ILeadsImportFormParams {
  CPF: string;
  name: string;
  mail: string;
  phone: string;
  files: FileList;
  attributes: Record<string, any>;
}

export const SheetImportModal = ({
  closeSheetImportModal,
  reloadLeads,
}: SheetImportModalParams) => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const { register, getValues } = useForm<ILeadsImportFormParams>({
    defaultValues: {
      CPF: "CPF",
      name: "NOME",
      mail: "EMAIL",
      phone: "TELEFONE",
      files: undefined,
      attributes: {},
    },
  });
  const handleSheetImportClick = (e: MouseEvent) => {
    if ((e.target as HTMLDivElement).id === "sheet-import-modal-backdrop")
      closeSheetImportModal();
  };

  const handleRead = async (e: FormEvent) => {
    e.preventDefault();
    const files = getValues("files");
    if (!files) return;
    const file = files[0];
    if (!file) return;
    const data = await sheetToJson(file);
    if (!data) {
      toast.error("Houve um erro ao ler a planilha.");
      return;
    }
    const { name, CPF, mail, phone, attributes } = getValues();
    const leadInputs: CreateLeadInput[] = [];
    for (const leadInput of data) {
      console.log({ leadInput });
      if (!leadInput[name]) continue;
      const newLeadInput: any = {
        companyId: session?.user.companyId,
        userId: session?.user.id,
      };
      newLeadInput.name = leadInput[name];
      if (leadInput[CPF]) newLeadInput.CPF = leadInput[CPF];
      if (leadInput[mail]) newLeadInput.mail = leadInput[mail];
      if (leadInput[phone]) newLeadInput.phone = leadInput[phone];
      for (const [attributeCorrectName, attributeFormName] of Object.entries(
        attributes
      )) {
        if (!newLeadInput.customFields) newLeadInput.customFields = {};
        if (leadInput[attributeFormName])
          newLeadInput.customFields[attributeCorrectName] =
            leadInput[attributeFormName];
      }

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
          customFields: {${
            leadInput.customFields
              ? jsonToGraphQLString(leadInput.customFields)
              : ""
          }}
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

  const attributes = useMemo(() => {
    const attributes = ctx.data.attributes;
    if (!attributes) return [];
    return attributes.filter(
      (attr) => attr.isActive && attr.types.includes(AtributeType.LEAD)
    );
  }, [ctx]);

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
          {...register("files")}
          accept=".xlsx, .xls, .csv, .ods"
        />
        <div className="mt-8">
          Configure as colunas de acordo com os campos à serem cadastrados:
        </div>
        <div className="text-xs text-gray-400">
          Ignore os campos que não forem ser utilizados
        </div>

        <div className="my-12 flex w-full flex-col gap-3">
          <div className="grid grid-cols-2">
            <div className="text-xs font-semibold text-gray-700">
              Nome do campo no sistema
            </div>
            <div className="text-xs font-semibold text-gray-700">
              Nome da coluna na planilha
            </div>
          </div>
          <div className="flex flex-row gap-3 ">
            <div className="font-semibold text-gray-700">Nome:</div>
            <input
              type="text"
              className="ml-auto basis-[50%] rounded-md border px-2"
              {...register("name")}
            />
          </div>
          <div className="flex flex-row gap-3 ">
            <div className="font-semibold text-gray-700">CPF:</div>
            <input
              type="text"
              className="ml-auto basis-[50%] rounded-md border px-2"
              {...register("CPF")}
            />
          </div>
          <div className="flex flex-row gap-3 ">
            <div className="font-semibold text-gray-700">Telefone:</div>
            <input
              type="text"
              className="ml-auto basis-[50%] rounded-md border px-2"
              {...register("phone")}
            />
          </div>
          <div className="flex flex-row gap-3 ">
            <div className="font-semibold text-gray-700">E-mail:</div>
            <input
              type="text"
              className="ml-auto basis-[50%] rounded-md border px-2"
              {...register("mail")}
            />
          </div>
          {attributes.map((attr) => (
            <div className="flex flex-row gap-3 " key={`attr-${attr.name}`}>
              <div className="font-semibold text-gray-700">{attr.name}:</div>
              <input
                type="text"
                className="ml-auto basis-[50%] rounded-md border px-2"
                {...register(`attributes.${attr.name}`)}
                defaultValue={attr.name}
              />
            </div>
          ))}
        </div>

        <PurpleButton>Importar</PurpleButton>
      </form>
    </div>
  );
};
