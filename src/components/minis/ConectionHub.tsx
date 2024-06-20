import {
  IconAnalyze,
  IconHandMiddleFinger,
  IconLoader2,
  IconPlugConnected,
  IconPlugConnectedX,
  IconVersionsFilled,
} from "@tabler/icons-react";
import axios from "axios";
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
import { reactContext } from "~/pages/_app";
import { ShineButton } from "../micros/ShineButton";
import { useIdleTimer } from "react-idle-timer";

export enum EConnectionStatus {
  UNKNOWN = "Desconhecido",
  DISCONNECTED = "Desconectado",
  DISCONNECTING = "Desconectando",
  MACHINE_INITIALIZED = "Iniciando módulo. Este processo levará até 2 minutos.",
  INITIALIZED = "Iniciando. Este processo levará até 2 minutos.",
  WAITING_QR = "Aguardando QRCode",
  WAITING_QR_READ = "Aguarando leitura do QRCode",
  LOADING = "Carregando dados...",
  AUTHENTICATED = "Autenticado",
  READY = "Pronto para uso",
}

export enum EState {
  CONFLICT = "CONFLICT",
  CONNECTED = "CONNECTED",
  DEPRECATED_VERSION = "DEPRECATED_VERSION",
  OPENING = "OPENING",
  PAIRING = "PAIRING",
  PROXYBLOCK = "PROXYBLOCK",
  SMB_TOS_BLOCK = "SMB_TOS_BLOCK",
  TIMEOUT = "TIMEOUT",
  TOS_BLOCK = "TOS_BLOCK",
  UNLAUNCHED = "UNLAUNCHED",
  UNPAIRED = "UNPAIRED",
  UNPAIRED_IDLE = "UNPAIRED_IDLE",
}

type TConectionHubParams = {
  setConnectionStatus: Dispatch<SetStateAction<EConnectionStatus>>;
  connectionStatus: EConnectionStatus;
};

const stateRefreshSeconds: Record<EConnectionStatus, number> = {
  [EConnectionStatus.READY]: 15,
  [EConnectionStatus.AUTHENTICATED]: 4,
  [EConnectionStatus.DISCONNECTED]: 6,
  [EConnectionStatus.WAITING_QR]: 4,
  [EConnectionStatus.INITIALIZED]: 4,
  [EConnectionStatus.MACHINE_INITIALIZED]: 4,
  [EConnectionStatus.LOADING]: 4,
  [EConnectionStatus.UNKNOWN]: 8,
  [EConnectionStatus.WAITING_QR_READ]: 4,
  [EConnectionStatus.DISCONNECTING]: 4,
};

const ConectionHub = ({
  connectionStatus,
  setConnectionStatus,
}: TConectionHubParams) => {
  const ctx = useContext(reactContext);
  const { data: session } = useSession();
  const [qrCode, setQrCode] = useState<string>();
  const [isIdle, setIsIdle] = useState(false);
  const [blockAutoVerify, setBlockAutoVerify] = useState(false);

  useIdleTimer({
    timeout: 1000 * 60 * 1, // 1 minuto de inatividade
    onIdle: () => setIsIdle(true),
    onActive: () => setIsIdle(false),
    debounce: 500,
  });

  const connectionDisplayMap: Record<EConnectionStatus, JSX.Element> = {
    [EConnectionStatus.UNKNOWN]: (
      <div className="flex flex-col items-center justify-center gap-1">
        <IconLoader2 className="animate-spin" />
        <div className="text-xs font-semibold text-gray-600">
          Obtendo informações
        </div>
      </div>
    ),
    [EConnectionStatus.DISCONNECTED]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="">❌ Desconectado</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Inicie o processo de conexão para usar o arremessador.
        </div>
      </div>
    ),
    [EConnectionStatus.READY]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="">✔ Conectado</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Você já pode usar o arremessador.
        </div>
      </div>
    ),
    [EConnectionStatus.DISCONNECTING]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin" />
          <div className="">Desconectando...</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          O sistema está se desconectando do seu WhatsApp
        </div>
      </div>
    ),
    [EConnectionStatus.MACHINE_INITIALIZED]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin" />
          <div className="">Iniciando...</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Iniciando ambiente exclusivo. Este processo pode levar até 2 minutos.
        </div>
      </div>
    ),

    [EConnectionStatus.INITIALIZED]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin" />
          <div className="">Iniciando...</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Iniciando WhatsApp. Este processo pode levar até 2 minutos.
        </div>
      </div>
    ),

    [EConnectionStatus.WAITING_QR]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin" />
          <div className="">Iniciando...</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Obtendo QRCode.
        </div>
      </div>
    ),

    [EConnectionStatus.WAITING_QR_READ]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="">QRCode</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Leia o QRCode com o leitor do seu WhatsApp.
        </div>
      </div>
    ),

    [EConnectionStatus.LOADING]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin" />
          <div className="">Sincronizando...</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Estamos sincronizando o sistema com seu WhatsApp.
        </div>
      </div>
    ),
    [EConnectionStatus.AUTHENTICATED]: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin" />
          <div className="">Autenticando...</div>
        </div>
        <div className="mt-1 border-t border-gray-600 text-xs font-semibold text-gray-600">
          Estamos autenticando o sistema com seu WhatsApp.
        </div>
      </div>
    ),
  };

  const checkMachineStatus = async () => {
    if (!session) return;
    // setConnectionStatus(EConnectionStatus.UNKNOWN);
    const res = await axios.post(
      "https://mulo5xpjs1.execute-api.sa-east-1.amazonaws.com/request",
      {
        userId: session.user.id,
        endpoint: "/check",
        requestData: {
          userId: session.user.id,
        },
      }
    );
    const data = res.data;
    if (
      data.instanceState === "pending" ||
      data.instanceStatus === "initializing"
    ) {
      setConnectionStatus(EConnectionStatus.MACHINE_INITIALIZED);
      return;
    }
    if (!data.data) {
      setConnectionStatus(EConnectionStatus.DISCONNECTED);
      setQrCode(undefined);
      return;
    }
    console.log(data.data);
    if (data.noInstance || data.data.state === EState.UNLAUNCHED) {
      setConnectionStatus(EConnectionStatus.DISCONNECTED);
      setQrCode(undefined);
      return;
    }

    if (
      data.data.instanceStatus === "initializing" ||
      data.data.state === EState.OPENING
    ) {
      setConnectionStatus(EConnectionStatus.INITIALIZED);
    }

    if (data.data.qr && data.data.state === EState.UNPAIRED_IDLE) {
      setConnectionStatus(EConnectionStatus.WAITING_QR_READ);
      setQrCode(data.data.qr);
      return;
    }
    if (data.data.state === EState.PAIRING) {
      setConnectionStatus(EConnectionStatus.LOADING);
      setQrCode(undefined);
      return;
    }
    if (data.data.state === EState.CONNECTED) {
      setConnectionStatus(EConnectionStatus.READY);
      setQrCode(undefined);
      return;
    }
  };

  const connect = async () => {
    if (!session) return;
    setConnectionStatus(EConnectionStatus.MACHINE_INITIALIZED);
    setBlockAutoVerify(true);

    const res = await axios.post(
      "https://mulo5xpjs1.execute-api.sa-east-1.amazonaws.com/create",
      {
        userId: session.user.id,
      }
    );

    setBlockAutoVerify(false);
    const data = res.data;

    if (!data.instanceId) {
      setConnectionStatus(EConnectionStatus.DISCONNECTED);
      toast.error("Erro ao iniciar ambiente.");
      return;
    }

    if (
      data.instanceState !== "running" ||
      data.instanceStatus !== "ok" ||
      data.systemStatus !== "ok"
    )
      await new Promise((resolve) => {
        setTimeout(() => resolve(3), 60000);
      });

    let connectRes = await axios.post(
      "https://mulo5xpjs1.execute-api.sa-east-1.amazonaws.com/request",
      {
        userId: session.user.id,
        endpoint: "/connect",
        requestData: {
          userId: session.user.id,
        },
      }
    );

    let connectData = connectRes.data;
    if (!connectData.data?.isConnected && connectData.data?.qrCode) {
      setQrCode(connectData.data.qrCode);
      setConnectionStatus(EConnectionStatus.WAITING_QR_READ);
      return;
    }
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => {
        setTimeout(() => resolve(3), 20000);
      });

      connectRes = await axios.post(
        "https://mulo5xpjs1.execute-api.sa-east-1.amazonaws.com/request",
        {
          userId: session.user.id,
          endpoint: "/connect",
          requestData: {
            userId: session.user.id,
          },
        }
      );
      connectData = connectRes.data;
      if (!connectData.data?.isConnected && connectData.data?.qrCode) {
        setQrCode(connectData.data.qrCode);
        setConnectionStatus(EConnectionStatus.WAITING_QR_READ);
        return;
      }
    }
  };

  const disconnect = async () => {
    if (!session) return;
    setConnectionStatus(EConnectionStatus.DISCONNECTING);

    await axios.post(
      "https://mulo5xpjs1.execute-api.sa-east-1.amazonaws.com/request",
      {
        userId: session.user.id,
        endpoint: "/disconnect",
        requestData: {
          userId: session.user.id,
        },
      }
    );
    setQrCode(undefined);
    setConnectionStatus(EConnectionStatus.DISCONNECTED);
    toast.success("Desconectado.");
  };

  useEffect(() => {
    if (!session || blockAutoVerify) return;
    if (!isIdle) {
      void checkMachineStatus();
      const interval = setInterval(() => {
        void checkMachineStatus();
      }, stateRefreshSeconds[connectionStatus] * 1000);

      return () => clearInterval(interval);
    }
  }, [isIdle, session]);

  return (
    <>
      <div className="flex h-full w-full flex-col justify-between rounded-md text-slate-700">
        <div
          className="flex h-full flex-col items-center justify-center gap-8 overflow-hidden  py-5 font-bold  transition-all duration-[1000ms]"
          id="qrcode-container"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="grid grid-cols-2 gap-6">
              <ShineButton
                className="flex hidden flex-row items-center justify-center gap-2"
                onClick={checkMachineStatus}
              >
                <IconAnalyze />
                verify
              </ShineButton>
              <ShineButton
                disabled={connectionStatus !== EConnectionStatus.DISCONNECTED}
                className="flex flex-row items-center justify-center gap-2"
                onClick={connect}
              >
                <IconPlugConnected />
                Conectar{" "}
              </ShineButton>
              <ShineButton
                className="flex flex-row items-center justify-center gap-2"
                onClick={disconnect}
              >
                <IconPlugConnectedX />
                Desconectar{" "}
              </ShineButton>
            </div>
            {connectionDisplayMap[connectionStatus]}
          </div>

          {isIdle && (
            <div className="text-xs font-semibold text-gray-700">
              {" "}
              Inatividade detectada, mova seu mouse para voltar a verificar a
              situação da conexão.{" "}
            </div>
          )}

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
