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
import { Category, UpdateUserInput, Role } from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { Toggle } from "~/components/micros/Toggle";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";

const EditUserPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const { register, getValues, reset } = useForm<UpdateUserInput>({
    defaultValues: ctx.data.user,
  });

  const { register: permissionsRegister, getValues: permissionsGetValues } =
    useForm({
      defaultValues: ctx.data.user?.permissions,
    });

  const updateUser = async (e: FormEvent) => {
    e.preventDefault();
    const { name, username, password, id } = getValues();

    const response = await fetchData({
      mutation: `
        mutation {
        updateUser(updateUserInput: {
        id: ${id}
        name: "${name}"
        username: "${username}"
        password: "${password}"
        companyId: ${session?.user.companyId}
        permissions: {${jsonToGraphQLString(permissionsGetValues())}}
        }) {
        name
        id
        companyId
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("Usuário atualizado com sucesso!");
      handlePanelChange("users", ctx, router);
    } else {
      toast.error("Houve um erro ao atualizar o usuário.");
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Editar Usuário
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={updateUser}>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Nome</span>
            <input
              type="text"
              className="rounded-lg border px-2 py-1"
              {...register("name")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Usuário</span>
              <input
                type="text"
                {...register("username")}
                className="rounded-lg border px-2 py-1"
                required
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Senha</span>
              <input
                type="text"
                {...register("password")}
                className="rounded-lg border px-2 py-1"
                required
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-6 flex flex-row items-center">
              <span className="text-sm text-gray-500">Permissões</span>
              <div className="ml-6 h-[1px] grow bg-gray-300"></div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-row gap-2">
                <Toggle
                  register={permissionsRegister}
                  parameter="accessUsers"
                />
                <span>Ver todos os usuários</span>
              </div>
              <div className="flex flex-row gap-2">
                <Toggle
                  register={permissionsRegister}
                  parameter="seeAllLeads"
                />
                <span>Ver todos os leads</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Usuário deve fazer login novamente para que as alterações de
            permissão façam efeito.
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("users", ctx, router)}
            >
              Cancelar
            </button>
            <button className="rounded-md border bg-jpurple px-5 py-1 font-semibold text-white transition hover:bg-jpurple/80">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditUserPanel;
