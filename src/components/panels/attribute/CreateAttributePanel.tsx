import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { FormEvent, useContext, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { useRouter } from "next/router";
import {
  AtributeType,
  AtributeValueType,
  Attribute,
  CreateAttributeInput,
} from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IconStars } from "@tabler/icons-react";
import { normalizeStringForGraphQL } from "~/helpers/normalizeStringForGraphQL";

const CreateAttributePanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const { register, getValues, reset } = useForm<CreateAttributeInput>();

  const handlePanelChange = (panel: string) => {
    ctx?.setData((prev) => {
      return {
        ...prev,
        currentPanel: panel,
      };
    });

    router.push(router.route, {
      query: {
        panel: panel,
      },
    });
  };

  const createAttribute = async (e: FormEvent) => {
    e.preventDefault();
    const { name, observation, types, valueType } = getValues();

    const normalizedName = normalizeStringForGraphQL(name);

    const response = await fetchData({
      mutation: `
        mutation {
        createAttribute(createAttributeInput: {
        name: "${normalizedName}"
        observation: "${observation}"
        companyId: ${session?.user.companyId}
        userId: ${session?.user.id}
        valueType: ${valueType}
        types: [${types}]
        }) {
        name
        id
        companyId
        types
        valueType
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response?.data.createAttribute) {
      toast.success("Atributo criado com sucesso!");
      const attribute = response.data.createAttribute;
      ctx.setData((prev) => {
        return {
          ...prev,
          attributes: [...(prev.attributes ?? []), attribute],
        };
      });
      reset();
    } else {
      toast.error("Houve um erro ao criar o atributo.");
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-8">
        <div className="flex flex-row items-center justify-between font-extrabold text-jpurple">
          <div className="text-3xl ">Criar Atributo</div>
          <IconStars />
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={createAttribute}>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Nome</span>
            <input
              type="text"
              className="rounded-lg border px-2 py-1"
              {...register("name")}
              required
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Descrição</span>
            <textarea
              className="rounded-lg border px-2 py-1"
              {...register("observation")}
              required
            />
          </div>

          <div className="grid w-full grid-cols-2 justify-between gap-8">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Tipo de Valor</span>
              <select
                className="rounded-lg border px-2 py-1"
                {...register("valueType")}
                required
              >
                <option value={AtributeValueType.STRING}>Texto</option>
                <option value={AtributeValueType.NUMBER}>Número</option>
                <option value={AtributeValueType.BOOLEAN}>SIM OU NÃO</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Aplicável à</span>
              <select
                className="rounded-lg border px-2 py-1"
                {...register("types")}
                required
              >
                <option value={AtributeType.LEAD}>Lead</option>
                <option value={AtributeType.PRODUCT}>Produto</option>
                <option value={AtributeType.QUOTE}>Orçamento</option>
                <option value={AtributeType.TICKET}>Ticket</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("attributes")}
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

export default CreateAttributePanel;
