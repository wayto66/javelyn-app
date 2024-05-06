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
import { Category, CreateUserInput, Role } from "~/types/graphql";
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

const CreateUserPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [filterModalVisibility, setFilterModalVisibility] = useState(false);

  const { register, getValues, reset } = useForm<CreateUserInput>();

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

  const getRoles = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!session || !session.user) {
      console.error("No session/user found.", session);
      return;
    }
    const response = await fetchData({
      query: `
      query roles {
        roles() {
          objects {
          id
          name
          }
          total
        }
      }
      `,
      token: session.user.accessToken,
      ctx,
    });
    const roles = response?.data?.roles.objects;
    if (!roles) return;
    setRoles(roles);
  };

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    const { name, username, password } = getValues();

    const response = await fetchData({
      mutation: `
        mutation {
        createUser(createUserInput: {
        name: "${name}"
        username: "${username}"
        password: "${password}"
        companyId: ${session?.user.companyId}
        }) {
        name
        id
        roleId
        companyId
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("Usuário criado com sucesso!");
      reset();
    } else {
      toast.error("Houve um erro ao criar o usuário.");
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  const roleOptions = useMemo(() => {
    const options: JSX.Element[] = [];
    for (const role of roles) {
      const option = <option value={role.id}>{role.name}</option>;
      options.push(option);
    }
    return options;
  }, [roles]);

  return (
    <>
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
      />
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Criar Usuário
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={createUser}>
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
                type="number"
                {...register("username")}
                className="rounded-lg border px-2 py-1"
                required
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Senha</span>
              <input
                type="number"
                {...register("password")}
                className="rounded-lg border px-2 py-1"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("categories")}
            >
              Cancelar
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

export default CreateUserPanel;
