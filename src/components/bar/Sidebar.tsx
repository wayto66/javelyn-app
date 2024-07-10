import {
  IconAd2,
  IconBox,
  IconCategory2,
  IconChevronRight,
  IconClipboardPlus,
  IconClipboardText,
  IconDashboard,
  IconHome,
  IconLock,
  IconLockOpen,
  IconLogout,
  IconMessage,
  IconMessageForward,
  IconMessageUp,
  IconSettings,
  IconStars,
  IconTag,
  IconTagStarred,
  IconTicket,
  IconUser,
  IconUserPlus,
  IconUsers,
  IconUserScan,
  IconUsersPlus,
} from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { reactContext } from "~/pages/_app";

type TSidebarConfigParams = {
  open: boolean;
  keepOpen: boolean;
  expandPanel: string;
};

type TSideMenuOption = {
  name: string;
  panelName: string;
  children: TSideMenuOption[];
  icon: JSX.Element;
  fatherIcon?: JSX.Element;
  requiredPermission?: string;
};

const sideMenuOptions: TSideMenuOption[] = [
  { name: "Home", panelName: "home", children: [], icon: <IconHome /> },

  {
    name: "Tasks",
    panelName: "tasks",
    children: [
      {
        name: "Listar Tasks",
        panelName: "tasks",
        children: [],
        icon: <IconClipboardText />,
      },
      {
        name: "Criar Task",
        panelName: "tasks-create",
        children: [],
        icon: <IconClipboardPlus />,
      },
      {
        name: "Listar Categorias",
        panelName: "tasks-categories",
        children: [],
        icon: <IconCategory2 />,
        requiredPermission: "seeTaskCategories",
      },
      {
        name: "Criar Categoria",
        panelName: "tasks-category-create",
        children: [],
        requiredPermission: "createTaskCategories",
        icon: <IconCategory2 />,
      },
    ],
    icon: <IconClipboardText />,
  },
  {
    name: "Dashboard",
    panelName: "dashboard",
    requiredPermission: "accessDashboard",

    children: [
      {
        name: "Geral",
        panelName: "dashboard",
        children: [],
        icon: <IconHome />,
      },
      {
        name: "Vendas",
        panelName: "dashboard-tickets",
        children: [],
        icon: <IconAd2 />,
      },
      {
        name: "Leads",
        panelName: "dashboard-leads",
        children: [],
        icon: <IconUsers />,
      },
    ],
    icon: <IconDashboard />,
  },
  {
    name: "Arremessador",
    panelName: "contact",
    children: [
      {
        name: "Importar Leads",
        panelName: "contact-import",
        children: [],
        icon: <IconUsers />,
      },
    ],
    icon: <IconMessageUp />,
    requiredPermission: "throw",
  },
  {
    name: "Leads",
    panelName: "leads",
    children: [
      {
        name: "Listar Leads",
        panelName: "leads",
        children: [],
        icon: <IconUsers />,
      },
      {
        name: "Lead Flow",
        panelName: "leads-flow",
        children: [],
        icon: <IconUsers />,
      },
      {
        name: "Leads Status",
        panelName: "leads-status",
        children: [],
        icon: <IconUserScan />,
      },
      {
        name: "Criar Lead",
        panelName: "leads-create",
        children: [],
        icon: <IconUsersPlus />,
      },
    ],
    icon: <IconUsers />,
  },

  {
    name: "Orçamentos",
    panelName: "quotes",
    children: [],
    icon: <IconTicket />,
  },

  {
    name: "Tickets",
    panelName: "tickets",
    children: [
      {
        name: "Listar Tickets",
        panelName: "tickets",
        children: [],
        icon: <IconTicket />,
      },
      {
        name: "Criar Ticket",
        panelName: "tickets-create",
        children: [],
        icon: <IconTicket />,
      },
    ],
    icon: <IconTicket />,
  },

  {
    name: "Produtos",
    panelName: "products",
    children: [
      {
        name: "Listar Produtos",
        panelName: "products",
        children: [],
        icon: <IconBox />,
      },
      {
        name: "Criar Produto",
        panelName: "products-create",
        children: [],
        icon: <IconBox />,
      },
      {
        name: "Listar Categorias",
        panelName: "products-categories",
        children: [],
        icon: <IconCategory2 />,
      },
      {
        name: "Criar Categoria",
        panelName: "products-category-create",
        children: [],
        icon: <IconCategory2 />,
      },
    ],
    icon: <IconBox />,
  },

  {
    name: "Usuários",
    panelName: "users",
    requiredPermission: "accessUsers",
    children: [
      {
        name: "Listar Usuários",
        panelName: "users",
        children: [],
        icon: <IconUser />,
      },
      {
        name: "Criar Usuário",
        panelName: "users-create",
        children: [],
        requiredPermission: "createUsers",
        icon: <IconUserPlus />,
      },
    ],
    icon: <IconUsers />,
  },

  {
    name: "Tags",
    panelName: "tags",
    children: [
      {
        name: "Listar Tags",
        panelName: "tags",
        children: [],
        icon: <IconTag />,
      },
      {
        name: "Criar Tag",
        panelName: "tags-create",
        children: [],
        icon: <IconTagStarred />,
      },
    ],
    icon: <IconTag />,
  },

  {
    name: "Atributos",
    panelName: "attributes",
    children: [
      {
        name: "Listar Atributos",
        panelName: "attributes",
        children: [],
        icon: <IconStars />,
      },
      {
        name: "Criar Atributo",
        panelName: "attributes-create",
        children: [],
        requiredPermission: "createAttributes",
        icon: <IconStars />,
      },
    ],
    icon: <IconStars />,
  },
];

export const Sidebar = () => {
  const { data, setData } = useContext(reactContext);
  const { data: session } = useSession();
  const router = useRouter();

  const [sidebarConfig, setSidebarConfig] = useState<TSidebarConfigParams>({
    open: true,
    keepOpen: true,
    expandPanel: "",
  });

  const handlePanelChange = (panel: string) => {
    setData((prev) => {
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

  return (
    <div
      className={`sidebar sticky top-0 h-screen transition-all ${
        sidebarConfig.keepOpen ? "w-[230px]" : "w-[100px]"
      } z-[10] overflow-visible `}
    >
      <div
        className={`flex h-full shadow-xl ${
          sidebarConfig.open ? "w-[230px]" : "w-[100px]"
        } flex-col items-center overflow-x-hidden bg-secondary p-3 transition-all duration-[300ms]`}
        onMouseEnter={() => {
          setSidebarConfig({ ...sidebarConfig, open: true });
        }}
        onMouseLeave={() => {
          if (!sidebarConfig.keepOpen) {
            setSidebarConfig({ ...sidebarConfig, open: false });
          }
        }}
      >
        <div className=" flex w-full flex-row items-center justify-between gap-6">
          <Link
            href={"/"}
            className={`${
              sidebarConfig.open
                ? "text-start"
                : "text-blue text-center text-xl font-extrabold"
            } w-full  text-sm font-bold uppercase text-white`}
          >
            {sidebarConfig.open ? session?.user.name : "J"}
          </Link>
          {sidebarConfig.open && (
            <button
              className="transition hover:rotate-12"
              onClick={() => {
                setSidebarConfig({
                  ...sidebarConfig,
                  keepOpen: !sidebarConfig.keepOpen,
                });
              }}
            >
              <i className="text-white">
                {sidebarConfig.keepOpen ? <IconLock /> : <IconLockOpen />}
              </i>
            </button>
          )}
        </div>

        <ul className={`w-full gap-6 text-white`}>
          {sideMenuOptions.map((option) => {
            if (
              !option.requiredPermission ||
              session?.user.permissions[option.requiredPermission]
            ) {
              return (
                <li className="my-2" key={Math.random()}>
                  <button
                    className={`flex w-full flex-row items-center ${
                      sidebarConfig.open ? "justify-start" : "justify-center"
                    } gap-4 rounded-xl px-2 py-2 transition 
                  ${
                    data?.currentPanel?.includes(option.panelName)
                      ? "hover:bg-blue/70 bg-jpurple"
                      : " hover:bg-white/20"
                  }`}
                    onClick={() => handlePanelChange(option.panelName)}
                  >
                    <i>{option.icon}</i>
                    {sidebarConfig.open && (
                      <span className="font-bold">{option.name}</span>
                    )}
                    {sidebarConfig.open && option.children.length > 0 && (
                      <i
                        className="ml-auto rounded-xl p-1 transition hover:bg-white/10"
                        onClick={() =>
                          setSidebarConfig({
                            ...sidebarConfig,
                            expandPanel:
                              sidebarConfig.expandPanel === option.panelName
                                ? " "
                                : option.panelName,
                          })
                        }
                      >
                        <IconChevronRight
                          className={`transition-all  ${
                            sidebarConfig.expandPanel === option.panelName
                              ? "rotate-90"
                              : "rotate-0"
                          } `}
                        />
                      </i>
                    )}
                  </button>
                  <ul
                    className={`w-full ${
                      sidebarConfig.open ? "block" : "hidden"
                    } ${
                      sidebarConfig.expandPanel === option.panelName
                        ? "h-auto"
                        : "h-0"
                    } overflow-hidden rounded-xl border border-gray-600 transition-all`}
                  >
                    {option.children.map((childOption) => {
                      if (
                        !childOption.requiredPermission ||
                        session?.user.permissions[
                          childOption.requiredPermission
                        ]
                      )
                        return (
                          <li key={Math.random()}>
                            <button
                              className={`flex w-full flex-row items-center ${
                                sidebarConfig.open
                                  ? "justify-start pl-5"
                                  : "justify-center"
                              } gap-6 rounded-xl py-2  transition hover:scale-[1.03] ${
                                data?.currentPanel === childOption.panelName
                                  ? "bg-jpurple "
                                  : " hover:bg-white/20"
                              }`}
                              onClick={() =>
                                handlePanelChange(childOption.panelName)
                              }
                            >
                              <div className="relative mr-[-25px] flex flex-row">
                                <i className="">{option.icon}</i>
                                <i className="z-[5] translate-x-[-10px] rounded-full bg-primary p-1">
                                  {childOption.icon}
                                </i>
                              </div>
                              {sidebarConfig.open && (
                                <span className="font-bold">
                                  {childOption.name}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                    })}
                  </ul>
                </li>
              );
            }
          })}
        </ul>

        <div className="bottom-0 mt-auto flex w-full flex-col border-t border-gray-500 pt-2">
          <button
            className={` flex w-full flex-row items-center ${
              sidebarConfig.open ? "justify-start" : "justify-center"
            } gap-6 rounded-xl px-2 py-2 transition ${
              data?.currentPanel === "settings"
                ? "bg-primary "
                : " hover:bg-white/20"
            }`}
            onClick={() => handlePanelChange("settings")}
          >
            <i>
              <IconSettings color="white" />
            </i>

            {sidebarConfig.open && (
              <span className="font-bold text-white">Configurações</span>
            )}
          </button>
          <button
            className={` flex w-full flex-row items-center hover:bg-white/20 ${
              sidebarConfig.open ? "justify-start" : "justify-center"
            } gap-6 rounded-xl px-2 py-2 transition `}
            onClick={() =>
              signOut({
                redirect: true,
                callbackUrl: "/",
              })
            }
          >
            <i>
              <IconLogout color="white" />
            </i>

            {sidebarConfig.open && (
              <span className="font-bold text-white">Sair</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
