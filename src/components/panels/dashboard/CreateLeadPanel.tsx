import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { useRouter } from "next/router";
import { AtributeType, CreateLeadInput, Tag } from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { AttributesDisplay } from "~/components/minis/AttributesDisplay";

const CreateLeadPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const { register, resetField, setValue, getValues, reset, watch, trigger } =
    useForm<CreateLeadInput>();
  const {
    register: customFieldsRegister,
    getValues: customFieldsGetValues,
    watch: customFieldsWatch,
  } = useForm();

  const createLead = async (e: FormEvent) => {
    e.preventDefault();
    const { observation, name, phone, CPF, mail } = getValues();

    const tagsIds = selectedTags.map((t) => t.id);
    const customFields = customFieldsGetValues();

    const response = await fetchData({
      mutation: `
        mutation {
        createLead(createLeadInput: {
        name: "${name}"
        ${phone && phone.length > 0 ? `phone: "${phone}"` : ""}
        ${mail && mail.length > 0 ? `mail: "${mail}"` : ""}
        ${CPF && CPF.length > 0 ? `CPF: "${CPF}"` : ""}
        companyId: ${session?.user.companyId}
        userId: ${session?.user.id}
        tagsIds: [${tagsIds}]
        observation: "${observation ?? ""}"
        customFields: {${jsonToGraphQLString(customFields)}}

        }) {
          lead {
             id
        name
          }
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response?.data.createLead.lead) {
      toast.success("Lead criado com sucesso!");
      reset();
    } else if (response?.data.error) {
      toast.error(
        response.data.message ?? "Houve um erro inesperado ao criar o lead."
      );
    } else {
      toast.error("Houve um erro inesperado ao criar o lead.");
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">Criar Lead</div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={createLead}>
          <div className="grid w-full grid-cols-2 gap-6">
            <div className="flex flex-col">
              <div className="text-sm text-gray-500">Nome</div>
              <input
                type="text"
                className="rounded-md border px-2 py-1"
                {...register("name")}
              />
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-500">Telefone</div>
              <input
                type="number"
                className="rounded-md border px-2 py-1"
                {...register("phone")}
              />
            </div>

            <div className="flex flex-col">
              <div className="text-sm text-gray-500">E-mail</div>
              <input
                type="text"
                className="rounded-md border px-2 py-1"
                {...register("mail")}
              />
            </div>

            <div className="flex flex-col">
              <div className="text-sm text-gray-500">CPF</div>
              <input
                type="text"
                className="rounded-md border px-2 py-1"
                {...register("CPF")}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Tags</div>
            <TagSelectionBox
              selectedTagId={selectedTagId}
              selectedTags={selectedTags}
              setSelectedTagId={setSelectedTagId}
              setSelectedTags={setSelectedTags}
            />
          </div>

          <AttributesDisplay
            type={AtributeType.LEAD}
            register={customFieldsRegister}
            watch={customFieldsWatch}
          />

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Observação</div>
            <textarea
              {...register("observation")}
              className="rounded-md border p-2"
            ></textarea>
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("leads", ctx, router)}
            >
              Voltar
            </button>
            <button className="rounded-md border bg-jpurple px-5 py-1 font-semibold text-white transition hover:bg-jpurple/80">
              Criar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateLeadPanel;
