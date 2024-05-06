import { IconLoader2 } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { fetchData } from "~/handlers/fetchData";
import fetchDbData from "~/helpers/fetchDbData";
import { reactContext } from "~/pages/_app";

export enum EConnectionStatus {
  UNKNOWN = "Desconhecido",
  DISCONNECTED = "Desconectado",
  INITIALIZED = "Iniciado",
  WAITING_QR = "Aguardando QRCode",
  WAITING_QR_READ = "Aguarando leitura do QRCode",
  LOADING = "Carregando dados...",
  AUTHENTICATED = "Autenticado",
  READY = "Pronto para uso",
}

type TConectionHubParams = {
  setConnectionStatus: Dispatch<SetStateAction<EConnectionStatus>>;
  connectionStatus: EConnectionStatus;
};

type TWhatsappConnectionInfo = {
  phone: string;
  name: string;
};

const ConectionHub = ({
  connectionStatus,
  setConnectionStatus,
}: TConectionHubParams) => {
  const ctx = useContext(reactContext);
  const { data: session, status } = useSession();
  const [connectionInfo, setConnectionInfo] = useState<
    TWhatsappConnectionInfo | undefined
  >();

  const [qrCode, setQrCode] = useState<string>();

  useEffect(() => {
    if (!session) return;
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL ?? "";
    const socket = io(url, {
      extraHeaders: {
        "company-id": session?.user.companyId.toString() ?? "0",
        "user-id": session?.user.id.toString() ?? "0",
      },
    });

    socket.on("client-initialized", (data) => {
      console.log("socket-event-initialized");
      setConnectionStatus(EConnectionStatus.INITIALIZED);
    });

    socket.on("client-waiting-qr", (data) => {
      console.log("i am waiting qr");
      setConnectionStatus(EConnectionStatus.WAITING_QR);
    });

    socket.on("client-qr-acquired", (data: { qr: string }) => {
      console.log("i am waiting for qr read");
      console.log({ data });
      setConnectionStatus(EConnectionStatus.WAITING_QR_READ);
      setQrCode(data.qr);
    });

    socket.on("client-disconnected", () => {
      console.log("socket-event-dsc");
      setConnectionStatus(EConnectionStatus.DISCONNECTED);
      setQrCode("");
    });

    socket.on("client-loading_screen", () => {
      console.log("socket-event-load");
      setConnectionStatus(EConnectionStatus.LOADING);

      setQrCode("");
    });

    socket.on("client-ready", ({ name, phone }) => {
      console.log({ name, phone });
      setConnectionInfo({
        name,
        phone,
      });
      setConnectionStatus(EConnectionStatus.READY);
      setQrCode("");
    });

    return () => {
      socket.emit("disconnectme");
    };
  }, [session]);

  const handleConnect = async () => {
    const response = await fetchData({
      ctx,
      mutation: `
      mutation {
      connectWhatsapp (connectWhatsappInput:{
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

    console.log({ response });
    if (
      response?.data.connectWhatsapp.qrCode &&
      connectionStatus === EConnectionStatus.DISCONNECTED
    ) {
      setQrCode(response?.data.connectWhatsapp.qrCode);
    }
  };

  const connectButtonDisplayMap = new Map<EConnectionStatus, JSX.Element>([
    [
      EConnectionStatus.DISCONNECTED,
      <button
        className="rounded-md bg-violet-500 px-2 py-1 uppercase text-white"
        onClick={handleConnect}
      >
        conectar
      </button>,
    ],
    [
      EConnectionStatus.UNKNOWN,
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="rounded-md bg-gray-700 px-2 py-1 uppercase text-white">
          <IconLoader2 className="animate-spin" />
        </div>
        <span className="text-center text-xs text-slate-500">
          Obtendo informações sobre sua conexão
        </span>
      </div>,
    ],
    [
      EConnectionStatus.READY,
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="rounded-md bg-green-500 px-2 py-1 uppercase text-white">
          Conectado
        </div>
        <span className="my-[-5px] text-center text-xs tracking-tight text-slate-400">
          como:
        </span>
        {connectionInfo && (
          <div className="text-center text-sm text-slate-500">
            {connectionInfo?.name} - {connectionInfo?.phone}
          </div>
        )}
      </div>,
    ],
    [
      EConnectionStatus.LOADING,
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-row gap-4 rounded-md bg-yellow-500 px-2 py-1 uppercase text-white">
          <span>Carregando</span>
          <IconLoader2 className="animate-spin" />
        </div>
        <span className="text-center text-xs text-slate-500">
          Por favor aguarde enquanto o sistema se conecta ao Whatsapp
        </span>
      </div>,
    ],
    [
      EConnectionStatus.WAITING_QR,
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-row gap-4 rounded-md bg-yellow-500 px-2 py-1 uppercase text-white">
          <span>Carregando</span>
          <IconLoader2 className="animate-spin" />
        </div>
        <span className="text-center text-xs text-slate-500">
          Por favor aguarde enquanto o sistema obtém o QRCode de conexão
        </span>
      </div>,
    ],
    [
      EConnectionStatus.WAITING_QR_READ,
      <div className="rounded-md bg-yellow-500 px-2 py-1 uppercase text-white">
        Leia o QRCode
      </div>,
    ],
    [
      EConnectionStatus.INITIALIZED,
      <div className="rounded-md bg-yellow-500 px-2 py-1 uppercase text-white">
        Iniciando conexão
      </div>,
    ],
  ]);

  return (
    <>
      <div className="flex h-full w-full flex-col justify-between rounded-md border bg-gradient-to-r from-slate-300 to-[Lavender] text-slate-700">
        <div
          className="flex h-full flex-col items-center justify-center gap-8 overflow-hidden bg-white py-5 font-bold  transition-all duration-[1000ms]"
          id="qrcode-container"
        >
          {connectButtonDisplayMap.get(connectionStatus)}

          {qrCode ? (
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "50%", width: "50%" }}
              value={qrCode}
              viewBox={`0 0 256 256`}
              className=""
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ConectionHub;
