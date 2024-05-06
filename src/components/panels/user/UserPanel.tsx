import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  MouseEventHandler,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { IconFilterSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Product, User } from "~/types/graphql";
import { toast } from "react-toastify";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { UserTableLine } from "~/components/micros/UserTableLine";

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

const UserPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [users, setUsers] = useState<User[]>([]);
  const [userTotalCount, setUserTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [filterModalVisibility, setFilterModalVisibility] = useState(false);

  const getUsers = async (e?: FormEvent) => {
    e?.preventDefault();
    const response = await fetchData({
      query: `
      query users {
        users(page: ${page}, pageSize: 50, filters: {
          companyId: ${session?.user.companyId}
        }) {
          objects {
          id
          name
          username
          password
          isActive
          permissions
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const users = response?.data?.users.objects;
    setUserTotalCount(response?.data.users.total);
    if (!users) return;

    setUsers(users);
  };

  const handleUserEdit = (user: User) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        user: user,
      };
    });
    handlePanelChange("users-edit", ctx, router);
  };

  const handleUserRemove = (user: User) => {
    const removeUser = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeUser (id: ${user.id}) {
        id
        name
        }
        }
        `,
      });

      if (response) {
        toast.success("Usuário desativado com sucesso.");
        setUsers((prev) => {
          if (!prev) return [];
          const _users = [...prev];
          const index = _users.findIndex((_user) => _user.id === user.id);
          const _user = _users[index];
          if (!_user) return prev;
          const updateduser: User = { ..._user, isActive: false };

          _users[index] = updateduser;

          return _users;
        });
      } else toast.error("Houve um erro ao desativar o produto.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja desativar o usuário: ${user.name} ?`,
          action: async () => {
            await removeUser();
          },
          visible: true,
        },
      };
    });
  };

  const handleUserRestore = async (user: User) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateUser (updateUserInput:{
                  id: ${user.id}
                  isActive: true
                }) {
                  id
                  name
                  isActive
                }
              }
        `,
    });

    if (response) {
      toast.success("Produto reativado com sucesso!");
      setUsers((prev) => {
        if (!prev) return [];
        const _users = [...prev];
        const index = _users.findIndex((_user) => _user.id === user.id);
        const _user = _users[index];
        if (!_user) return prev;
        const updatedUser: User = { ..._user, isActive: true };

        _users[index] = updatedUser;

        return _users;
      });
    } else toast.error("Houve um erro ao reativar o produto.");
  };

  useEffect(() => {
    getUsers();
  }, [page]);

  const userDisplay = useMemo(() => {
    const display: JSX.Element[] = [];
    for (const user of users) {
      if (user.permissions.alabarda) continue;
      const userLine = (
        <UserTableLine
          user={user}
          handleEdit={handleUserEdit}
          handleRemove={handleUserRemove}
          handleRestore={handleUserRestore}
        ></UserTableLine>
      );

      display.push(userLine);
    }

    return display;
  }, [users]);

  return (
    <>
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
      />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Usuários</div>
        </div>

        <table
          className=" mt-12 w-full table-auto overflow-scroll  rounded-md p-2"
          id="user-table"
        >
          <thead className="overflow-hidden rounded-t-md  bg-gray-300 text-gray-600">
            <tr className="rounded-md">
              <th className="cursor-pointer rounded-tl-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Nome
              </th>

              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Usuário
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Senha
              </th>
              <th className="cursor-pointer rounded-tr-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Ações
              </th>
            </tr>
          </thead>
          <tbody id="user-table-body" className="border border-gray-400">
            {userDisplay}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserPanel;
