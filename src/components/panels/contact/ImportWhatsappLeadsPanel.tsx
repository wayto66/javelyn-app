import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ConectionHub, { EConnectionStatus } from "../../minis/ConectionHub";
import { reactContext } from "~/pages/_app";
import { toast } from "react-toastify";
import PurpleButton from "../../micros/PurpleButton";
import { fetchData } from "~/handlers/fetchData";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { useRouter } from "next/router";
import { MessageConfirmationModal } from "../../modals/MessageConfirmationModal";
import { Lead, LeadStatus } from "~/types/graphql";
import { InputSanitizer } from "~/helpers/InputSanitizer";
import { LeadContactTableLine } from "../../micros/LeadContactTableLine";
import {
  IconDeviceFloppy,
  IconDevicesSearch,
  IconFileImport,
  IconLoader2,
  IconPlus,
  IconTool,
  IconX,
  IconXboxA,
} from "@tabler/icons-react";
import axios from "axios";
import { ShineButton } from "~/components/micros/ShineButton";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { Toggle } from "~/components/micros/Toggle";
import Image from "next/image";

const ImportWhatsappLeadsPanel = () => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const [leads, setLeads] = useState<Lead[]>();

  useEffect(() => {
    document.body.onkeyup = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document
          .querySelector("#message-confirm-modal-container")
          ?.classList.add("hidden");
      }
    };
  });

  const importLeads = async () => {
    if (!session) return;

    ctx?.setData((prev) => {
      return {
        ...prev,
        isLoading: true,
      };
    });

    const getChatsRequest = await axios.post(
      "https://mulo5xpjs1.execute-api.sa-east-1.amazonaws.com/request",
      {
        userId: session.user.id,
        endpoint: "/get-recent-chats",
        requestData: {
          userId: session.user.id,
        },
      }
    );

    const data = getChatsRequest.data;

    const newLeads = data.data as any[];

    if (!newLeads?.length) {
      toast.error("Houve um erro ao importar, tente novamente.");
      return;
    }

    for (const lead of newLeads) {
      lead.isActive = true;
      lead.companyId = session.user.companyId;
      lead.userId = session.user.id;
      lead.phone = lead.telefone;
      lead.name = lead.nome;
      delete lead.nome;
      delete lead.telefone;
    }

    ctx?.setData((prev) => {
      return {
        ...prev,
        isLoading: false,
      };
    });

    setLeads(newLeads);
  };

  const registerLeads = async () => {
    if (!leads || leads.length === 0) {
      toast.error("Nenhum lead encontrado");
      return;
    }
    const filteredLeads = leads.filter((lead) => lead.isActive);
    const leadsArrayString = `[${filteredLeads
      .map((lead) => `{${jsonToGraphQLString(lead)}}`)
      .join(",")}]`;
    const response = await fetchData({
      mutation: `
        mutation {
        importWhatsappLeads(importWhatsappLeadsInput: {
        leads: ${leadsArrayString}
        }) {
        count
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response?.data?.importWhatsappLeads.count) {
      toast.success(
        `${response?.data?.importWhatsappLeads.count} leads importados com sucesso!`
      );
    } else {
      toast.error("Houve um erro ao importar os leads.");
    }
  };

  const leadsDisplay = useMemo(() => {
    const leadItems: JSX.Element[] = [];
    if (!leads) return leadItems;
    for (const lead of leads) {
      const item = (
        <tr
          className={`${
            lead.isActive ? "bg-violet-50" : "opacity-70"
          } py-1 transition hover:bg-gray-300`}
          key={`lead-tr-${lead.id}-${Math.random()}`}
        >
          <td className="flex cursor-pointer items-center justify-center text-sm text-red-500">
            <input
              type="checkbox"
              className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-500 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-400 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-jpurple checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-jpurple checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-jpurple checked:focus:bg-jpurple checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-jpurple dark:checked:after:bg-jpurple dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
              checked={lead.isActive}
              onChange={(e) =>
                setLeads((prev) => {
                  if (!prev) return prev;
                  const leadsLocal = [...prev];
                  const tgLead = leadsLocal.find(
                    (ld) => ld.phone === lead.phone
                  );
                  if (!tgLead) return prev;
                  tgLead.isActive = !tgLead.isActive;
                  return leadsLocal;
                })
              }
            />
          </td>
          <td className="px-2 text-sm font-semibold">{lead.name}</td>
          <td className="px-2 text-sm">{lead.phone}</td>
        </tr>
      );
      leadItems.push(item);
    }
    return leadItems;
  }, [leads]);

  return (
    <>
      <div className=" mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-center">
        <div className="mt-8 flex flex-col rounded-md p-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xl font-bold tracking-tighter text-gray-800">
              Importar Leads do WhatsApp
            </div>
            <Image
              src="/images/png/lead-import.png"
              width={250}
              height={250}
              alt="lead-import"
            />
          </div>
          {ctx.data.connectionStatus != EConnectionStatus.READY && (
            <div className="mb-2 w-full text-xs font-semibold text-red-500">
              {" "}
              Volte ao painel de arremessador e faça a conexão com seu WhatsApp
              para poder importar leads.{" "}
            </div>
          )}
          <div className=" grid grid-cols-2 gap-8">
            <ShineButton
              disabled={ctx.data.connectionStatus != EConnectionStatus.READY}
              onClick={importLeads}
              className="flex items-center justify-center gap-2"
            >
              {ctx.data.isLoading ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                <>
                  <IconFileImport />
                  Carregar Leads
                </>
              )}
            </ShineButton>
            <ShineButton
              onClick={registerLeads}
              disabled={!(leads && leads.length > 0)}
              className="flex items-center justify-center gap-2"
            >
              <IconDeviceFloppy />
              Salvar
            </ShineButton>
          </div>

          {leads && (
            <div className="mt-6 flex p-6 ">
              <table className="border-separate border-spacing-3">
                <thead>
                  <tr className="bg-jpurple text-white">
                    <th className="px-2">Remover</th>
                    <th className="px-2">Nome</th>
                    <th className="px-2">Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-jpurple/20 text-start font-normal text-gray-800">
                    <th className="px-2">
                      <input
                        type="checkbox"
                        className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-500 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-400 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-jpurple checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-jpurple checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-jpurple checked:focus:bg-jpurple checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-jpurple dark:checked:after:bg-jpurple dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                        checked={leads.every((ld) => ld.isActive)}
                        onChange={(e) =>
                          setLeads((prev) =>
                            prev?.map((lead) => {
                              return {
                                ...lead,
                                isActive: !prev.every((ld) => ld.isActive),
                              };
                            })
                          )
                        }
                      />
                    </th>
                    <th className="px-2">Todos</th>
                    <th className="px-2">-</th>
                  </tr>
                  {leadsDisplay}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImportWhatsappLeadsPanel;
