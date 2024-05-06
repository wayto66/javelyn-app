import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ConectionHub, { EConnectionStatus } from "../minis/ConectionHub";
import { reactContext } from "~/pages/_app";
import { toast } from "react-toastify";
import PurpleButton from "../micros/PurpleButton";
import { fetchData } from "~/handlers/fetchData";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { useRouter } from "next/router";
import { MessageConfirmationModal } from "../modals/MessageConfirmationModal";
import { Lead } from "~/types/graphql";
import { InputSanitizer } from "~/helpers/InputSanitizer";
import { LeadContactTableLine } from "../micros/LeadContactTableLine";
import { IconTool } from "@tabler/icons-react";

const ContactPanel = () => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>();
  const [previewMessage, setPreviewMessage] = useState("");
  const [confirmationVisibility, setConfirmationVisibility] = useState(false);
  const [javelynThrowImage, setJavelynThrowImage] = useState<File | null>();
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

  const handleDisconnect = async () => {
    const response = await fetchData({
      ctx,
      mutation: `
      mutation {
      disconnectWhatsapp (disconnectWhatsappInput:{
      companyId: 1
      userId: 1
      }) {
      isConnected
      message
      qrCode
      }
      }
      `,
    });
    const responseMessage = response?.data?.disconnectWhatsapp?.message;
    if (responseMessage) {
      toast.info(responseMessage);
    } else {
      toast.error("Houve um erro no servidor.");
    }
  };

  const handleShutdown = async () => {
    const response = await fetchData({
      ctx,
      mutation: `
      mutation {
      shutdownWhatsapp (shutdownWhatsappInput:{
      companyId: 1
      userId: 1
      }) {
      succeeded
      }
      }
      `,
    });
    const succeeded = response?.data?.shutdownWhatsapp?.succeeded;
    if (succeeded) {
      toast.success("Todas as conexões foram encerradas.");
    } else {
      toast.error("Houve um erro no servidor.");
    }
  };

  const showMessageConfirmationModal = () => setConfirmationVisibility(true);
  const closeMessageConfirmationModal = () => setConfirmationVisibility(false);

  const handleMessageFormVerify = async (event: any) => {
    event.preventDefault();

    const leads: Lead[] = ctx.data.currentLeads ?? [];

    if (leads.length === 0 && !phoneNumbers) {
      toast.warn(
        "Por favor, insira um número telefone ou selecione ao menos um Lead no painel de Leads."
      );
      return;
    }

    if (leads.length === 0) {
      setPreviewMessage(message);
      showMessageConfirmationModal();
    }

    const firstLead = leads[0];
    if (!firstLead) return;

    const name = firstLead.name.split(" ")[0]?.toLowerCase();
    if (!name) return;
    const formatedName = name.charAt(0).toUpperCase() + name.slice(1);

    setPreviewMessage(() => {
      const format1 = message.replace("$[NOME]", formatedName);
      return format1;
    });

    showMessageConfirmationModal();
  };

  const handleMessageSubmit = async (event: any) => {
    const leads = ctx.data.currentLeads?.map((lead) => lead.id) ?? [];

    const response = await fetchData({
      ctx,
      mutation: `
      mutation {
      sendMessage (sendMessageInput:{
      userId: ${session?.user.id},
      message: ${message},
      leadIds: [${leads}],
      file: ${javelynThrowImage},
      companyId: ${session?.user.companyId}, 
      phoneNumbers: [${phoneNumbers}]   
      }) {
      succeeded
      }
      }
      `,
    });

    if (response?.data.sendMessage.succeeded) {
      toast.success("Enviados com sucesso!");
    } else {
      toast.error("Houve um erro ao enviar as mensagens.");
    }

    closeMessageConfirmationModal();
  };

  const handleRemoveLeadFromList = (lead: Lead) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentLeads: prev.currentLeads?.filter((l) => l.id !== lead.id),
      };
    });
  };

  const handleEditLead = (lead: Lead) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentLeadData: lead,
      };
    });
    handlePanelChange("leads-edit", ctx, router);
  };

  const leadsDisplay = useMemo(() => {
    const leadItems: JSX.Element[] = [];
    const leads = ctx.data.currentLeads;
    if (!leads) return leadItems;
    for (const lead of leads) {
      const item = (
        <LeadContactTableLine
          lead={lead}
          handleRemove={handleRemoveLeadFromList}
          handleEdit={handleEditLead}
        />
      );
      leadItems.push(item);
    }
    return leadItems;
  }, [ctx.data.currentLeads]);

  const inMaintenance = false;
  if (inMaintenance)
    return (
      <main className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
          <IconTool className="animate-pulse" />
          <span>
            Esta seção está em manutenção atualmente e estará disponível em
            breve.
          </span>
        </div>
      </main>
    );

  return (
    <>
      {confirmationVisibility && (
        <MessageConfirmationModal
          closeModal={closeMessageConfirmationModal}
          onSubmit={handleMessageSubmit}
          previewMessage={previewMessage}
        />
      )}
      <div className="bg- mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-center">
        <div className="grid w-full grid-cols-2 justify-between rounded-md bg-[lavender]">
          {" "}
          <div className="border ">
            <ConectionHub
              connectionStatus={connectionStatus}
              setConnectionStatus={setConnectionStatus}
            />
          </div>
          <div className="flex h-full flex-col items-center justify-center">
            {" "}
            <div className="grid w-full grid-cols-2 items-start justify-items-center  gap-x-4 p-3">
              <div className="flex flex-col items-center rounded-md border border-white">
                <button
                  className="h-max w-full cursor-pointer rounded-md bg-[MediumSlateBlue] px-2 py-1 font-extrabold uppercase text-white transition hover:bg-[MediumViolet] active:scale-[0.98]"
                  onClick={handleShutdown}
                >
                  shutdown
                </button>
                <div className="mx-auto mb-6 mt-2 max-w-[90%] rounded-md border p-2 text-xs font-normal  text-slate-500">
                  Desconecta o whatsapp de todos usuários de sua empresa. <br />
                  <br />
                </div>
              </div>
              <div className="flex h-full flex-col items-center rounded-md border border-white">
                <button
                  className="h-max w-full cursor-pointer rounded-md bg-[MediumSlateBlue] px-2 py-1 font-extrabold uppercase text-white transition hover:bg-[MediumViolet] active:scale-[0.98]"
                  onClick={handleDisconnect}
                >
                  Desconectar
                </button>
                <div className="mx-auto mb-6 mt-2 max-w-[90%] rounded-md border p-2 text-xs font-normal  text-slate-500">
                  Desconecta seu whatsapp do sistema JAVELYN.
                </div>
              </div>
            </div>
          </div>
        </div>
        {leadsDisplay.length > 0 ? (
          <div className="my-6 flex w-full flex-col justify-between overflow-hidden overflow-hidden rounded-md border bg-gradient-to-r from-slate-300 to-[Lavender] font-extrabold  text-slate-700">
            <div
              className="flex cursor-pointer flex-row justify-between px-4 py-1 transition hover:bg-white/10 active:bg-white/30"
              onClick={() => {
                const clientsContainer = document.querySelector(
                  "#contact-client-list"
                );
                if (!clientsContainer) return;
                if (clientsContainer.classList.contains("!h-0")) {
                  clientsContainer.classList.remove("!h-0");
                  clientsContainer.classList.add("p-3");
                  return;
                }
                clientsContainer.classList.add("!h-0");
                clientsContainer.classList.remove("p-3");
              }}
            >
              <span className="uppercase text-slate-600">Clientes</span>
              <span>\/</span>
            </div>

            <div
              className=" w-full overflow-hidden bg-white  font-normal"
              id="contact-client-list"
            >
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border px-1">Nome</th>
                    <th className="border px-1">Telefone</th>
                    <th className="border px-1">Arremessos</th>
                    <th className="border px-1">Último arremesso</th>
                  </tr>
                </thead>
                <tbody id="contact-client-table-body">{leadsDisplay}</tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="my-6 flex w-full flex-col gap-3 border px-1 py-3">
            <span className="w-full text-center">
              Parece que você não selecionou clientes ainda
            </span>
            <div className="flex flex-row justify-around">
              <button
                className="rounded-md bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue] px-2 py-1 font-bold uppercase text-white  transition hover:scale-[1.03] active:scale-[0.96] "
                onClick={() => {
                  handlePanelChange("leads", ctx, router);
                }}
              >
                <span className="drop-shadow-xl"> Selecionar no Painel</span>
              </button>
              <button
                className="rounded-md bg-gradient-to-r from-[MediumPurple] to-[MediumSlateBlue] px-2 py-1 font-bold uppercase text-white transition hover:scale-[1.03] active:scale-[0.96]"
                onClick={() => {
                  const phoneInput = document.querySelector("#phone-input");
                  if (phoneInput) {
                    phoneInput.classList.contains("hidden")
                      ? phoneInput.classList.remove("hidden")
                      : phoneInput.classList.add("hidden");
                  }
                }}
              >
                Inserir Manualmente
              </button>
            </div>
          </div>
        )}
        <form
          className="flex w-full flex-col gap-6 rounded-md bg-gradient-to-b from-slate-300 to-[Lavender] p-4 shadow-xl"
          onSubmit={(e) => handleMessageFormVerify(e)}
        >
          <input
            type="text"
            className="hidden rounded-md border p-2"
            placeholder="Insira o telefone. Para inserir vários, separe os números utilizando vírgula."
            id="phone-input"
            onKeyUp={(e) => {
              const inputPhones = (e.target as HTMLInputElement).value;
              const newPhoneNumbers = inputPhones
                .split(",")
                .map((pn) => InputSanitizer.phone(pn));
              setPhoneNumbers(newPhoneNumbers);
            }}
          />

          <div className="grid grid-cols-3 gap-12">
            <textarea
              className="col-span-2 rounded-md border p-2"
              placeholder="Insira a mensagem à ser enviada."
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />

            <div className="flex w-full flex-row items-center gap-6 rounded-md border border-[mediumslateblue] pl-2 ">
              <div className="text-sm font-bold text-slate-500">Imagem: </div>
              <input
                type="file"
                name="imagem"
                accept="image/*"
                className="rounded-r-md bg-[mediumslateblue] p-2 font-bold text-white"
                draggable
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  console.log(e.target.files);
                  setJavelynThrowImage(
                    e.target.files ? e.target.files[0] : null
                  );
                }}
              />
            </div>
          </div>
          {connectionStatus === EConnectionStatus.READY ? (
            <PurpleButton>Enviar</PurpleButton>
          ) : (
            <div className="mx-auto  rounded-md bg-white px-7 py-2 text-xs font-semibold  text-slate-700">
              Necessário conexão com Whatsapp para poder arremessar
            </div>
          )}
        </form>{" "}
      </div>
    </>
  );
};

export default ContactPanel;
