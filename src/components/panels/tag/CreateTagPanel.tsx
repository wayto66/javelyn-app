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
import { Category, CreateTagInput } from "~/types/graphql";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type TFilterModalParams = {
  visibility: boolean;
  setVisibility: Dispatch<SetStateAction<boolean>>;
};

const FilterModal = ({ visibility, setVisibility }: TFilterModalParams) => {
  const closeModal = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    if ((e.target as HTMLDivElement).id === "filter-overlay")
      setVisibility((prev) => !prev);
  };

  return (
    <>
      {visibility && (
        <div
          className="fixed inset-0 z-[50] h-screen w-screen bg-black/50"
          id="filter-overlay"
          onClick={(e) => closeModal(e)}
        >
          <div className="ml-auto flex h-screen min-w-[30vw] max-w-[50vw] flex-col overflow-y-auto bg-white"></div>
        </div>
      )}
    </>
  );
};

const CreateTagPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const { register, getValues, reset, watch } = useForm<CreateTagInput>();

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

  const createTag = async (e: FormEvent) => {
    e.preventDefault();
    const { name, colorHex, description } = getValues();
    console.log(getValues());
    const response = await fetchData({
      mutation: `
        mutation {
        createTag(createTagInput: {
        name: "${name}"
        colorHex: "${colorHex}"
        description: "${description}"
        companyId: ${session?.user.companyId}
        }) {
        name
        id
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("Tag criada com sucesso!");
      reset();
    } else {
      toast.error("Houve um erro ao criar a tag.");
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">Criar Tag</div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={createTag}>
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
              {...register("description")}
              required
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Cor</span>
            <input
              type="color"
              className="w-full rounded-lg border px-2 py-1"
              {...register("colorHex")}
              required
            />
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("tags")}
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

export default CreateTagPanel;
