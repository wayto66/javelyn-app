import { FormEvent, MouseEvent, useContext, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { sheetToJson } from "~/helpers/sheetToJson";
import { ShineButton } from "../micros/ShineButton";
import PurpleButton from "../micros/PurpleButton";
import { AtributeType } from "~/types/graphql";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { arrayToGraphQLString } from "~/helpers/arrayToGraphQLString";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";

type FieldChooseModalParams = {
  closeFieldChooseModal: () => void;
  reloadQuotes: () => Promise<void>;
};

export interface IQuoteFieldsFormParams {
  CPF: boolean;
  name: boolean;
  mail: boolean;
  phone: boolean;
  customFields: Record<string, boolean>;
  tags: boolean;
  date: boolean;
  value: boolean;
  user: boolean;
}

export const QuoteFieldChooseModal = ({
  closeFieldChooseModal,
  reloadQuotes,
}: FieldChooseModalParams) => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const { register, getValues } = useForm<IQuoteFieldsFormParams>({
    defaultValues: {
      date:
        typeof ctx.data.quoteFieldsToShow.date === "boolean"
          ? ctx.data.quoteFieldsToShow.date
          : true,
      CPF:
        typeof ctx.data.quoteFieldsToShow.CPF === "boolean"
          ? ctx.data.quoteFieldsToShow.CPF
          : true,
      name: true,
      mail:
        typeof ctx.data.quoteFieldsToShow.mail === "boolean"
          ? ctx.data.quoteFieldsToShow.mail
          : true,
      phone:
        typeof ctx.data.quoteFieldsToShow.phone === "boolean"
          ? ctx.data.quoteFieldsToShow.phone
          : true,
      tags:
        typeof ctx.data.quoteFieldsToShow.tags === "boolean"
          ? ctx.data.quoteFieldsToShow.tags
          : true,
      value:
        typeof ctx.data.quoteFieldsToShow.value === "boolean"
          ? ctx.data.quoteFieldsToShow.value
          : true,
      user:
        typeof ctx.data.quoteFieldsToShow.user === "boolean"
          ? ctx.data.quoteFieldsToShow.user
          : true,
      customFields:
        typeof ctx.data.quoteFieldsToShow.customFields !== "boolean"
          ? ctx.data.quoteFieldsToShow.customFields
          : {},
    },
  });
  const handleBackdropClick = (e: MouseEvent) => {
    if ((e.target as HTMLDivElement).id === "sheet-import-modal-backdrop")
      closeFieldChooseModal();
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    const { CPF, customFields, mail, name, phone, tags, date, user, value } =
      getValues();

    ctx.setData((prev) => {
      return {
        ...prev,
        quoteFieldsToShow: {
          date,
          CPF,
          mail,
          phone,
          tags,
          name,
          user,
          value,
          customFields,
        },
      };
    });

    closeFieldChooseModal();
    reloadQuotes();
  };

  useEffect(() => {
    console.log({ attrs: ctx.data.attributes });
  });

  const attributes = useMemo(() => {
    const attributes = ctx.data.attributes;
    if (!attributes) return [];
    return attributes.filter(
      (attr) => attr.isActive && attr.types.includes(AtributeType.QUOTE)
    );
  }, [ctx]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex  h-screen w-screen items-center justify-center bg-black/50 backdrop-blur"
      id="sheet-import-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <form
        className="flex flex-col  rounded-md bg-white p-6"
        onSubmit={handleSave}
      >
        <div className="mt-8 font-semibold">
          Selecione os campos que deseja exibir:
        </div>

        <div className="my-12 flex w-full flex-col gap-3">
          <div className="flex flex-row items-center gap-2" key={`attr-date`}>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
              {...register(`date`)}
              defaultChecked={false}
            />
            <div className="font-semibold text-gray-700">Data de Entrada</div>
          </div>
          <div className="flex flex-row items-center gap-2" key={`attr-CPF`}>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
              {...register(`CPF`)}
              defaultChecked={false}
            />
            <div className="font-semibold text-gray-700">CPF</div>
          </div>
          <div className="flex flex-row items-center gap-2" key={`attr-phone`}>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
              {...register(`phone`)}
              defaultChecked={false}
            />
            <div className="font-semibold text-gray-700">Telefone</div>
          </div>
          <div className="flex flex-row items-center gap-2" key={`attr-user`}>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
              {...register(`user`)}
              defaultChecked={false}
            />
            <div className="font-semibold text-gray-700">Usuário</div>
          </div>
          <div className="flex flex-row items-center gap-2" key={`attr-value`}>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
              {...register(`value`)}
              defaultChecked={false}
            />
            <div className="font-semibold text-gray-700">Valor</div>
          </div>
          <div className="flex flex-row items-center gap-2" key={`attr-mail`}>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
              {...register(`mail`)}
              defaultChecked={false}
            />
            <div className="font-semibold text-gray-700">Email</div>
          </div>
          <div className="flex flex-row items-center gap-2" key={`attr-tags`}>
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
              {...register(`tags`)}
              defaultChecked={false}
            />
            <div className="font-semibold text-gray-700">Tags</div>
          </div>
          {attributes.map((attr) => (
            <div
              className="flex flex-row items-center gap-2"
              key={`attr-${attr.name}`}
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 transition duration-200 ease-in-out focus:ring-blue-500"
                {...register(`customFields.${attr.name}`)}
                defaultChecked={false}
              />
              <div className="font-semibold text-gray-700">{attr.name}</div>
            </div>
          ))}
        </div>

        <PurpleButton>Salvar</PurpleButton>
      </form>
    </div>
  );
};
