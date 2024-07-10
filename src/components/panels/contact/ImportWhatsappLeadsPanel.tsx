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
import { Lead } from "~/types/graphql";
import { InputSanitizer } from "~/helpers/InputSanitizer";
import { LeadContactTableLine } from "../../micros/LeadContactTableLine";
import { IconPlus, IconTool, IconX, IconXboxA } from "@tabler/icons-react";
import axios from "axios";
import { ShineButton } from "~/components/micros/ShineButton";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";

const ImportWhatsappLeadsPanel = () => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>();

  const [connectionStatus, setConnectionStatus] = useState<EConnectionStatus>(
    EConnectionStatus.UNKNOWN
  );

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
    const newLeads = [
      {
        name: "bruno1",
        phone: "16988884444",
      },
      {
        name: "antonio1",
        phone: "16988882222",
      },
      {
        name: "paula1",
        phone: "16988885555",
      },
    ] as Lead[];

    for (const lead of newLeads) {
      lead.isActive = true;
      lead.companyId = session.user.companyId;
      lead.userId = session.user.id;
    }

    setLeads(newLeads);
  };

  const registerLeads = async () => {
    if (!leads || leads.length === 0) {
      toast.error("Nenhum lead encontrado");
      return;
    }
    const leadsArrayString = `[${leads
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

  const removeLead = (name: string, phone: string | null | undefined) => {
    if (!leads) return;
    setLeads(leads.filter((ld) => ld.name !== name && ld.phone !== phone));
  };

  const leadsDisplay = useMemo(() => {
    const leadItems: JSX.Element[] = [];
    if (!leads) return leadItems;
    for (const lead of leads) {
      const item = (
        <tr
          className={`${
            lead.isActive ? "bg-violet-50" : "bg-red-400"
          } py-1 transition hover:bg-gray-300`}
          key={`lead-tr-${lead.id}-${Math.random()}`}
        >
          <td
            className="cursor-pointer px-2 text-sm text-red-500"
            onClick={() => removeLead(lead.name, lead.phone)}
          >
            <IconX />
          </td>
          <td className="px-2 text-sm">{lead.name}</td>
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
        <div className="flex w-full justify-between rounded-md ">
          {" "}
          <div className="grow ">
            <ConectionHub
              connectionStatus={connectionStatus}
              setConnectionStatus={setConnectionStatus}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col rounded-md p-6 shadow-xl">
          <div className=" grid grid-cols-2 gap-8">
            <ShineButton onClick={importLeads}>Carregar Leads</ShineButton>
            <ShineButton
              onClick={registerLeads}
              disabled={!(leads && leads.length > 0)}
            >
              Confirmar
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
                <tbody>{leadsDisplay}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImportWhatsappLeadsPanel;
