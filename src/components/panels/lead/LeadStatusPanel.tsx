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
import { ShineButton } from "../../micros/ShineButton";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconEdit,
  IconFilter,
  IconFilters,
  IconLoader2,
  IconPlus,
  IconRestore,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { SortBy, LeadStatus } from "~/types/graphql";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { PageSelectDisplay } from "~/components/minis/PageSelector";
import { useForm } from "react-hook-form";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { toast } from "react-toastify";

type TLeadStatusBoxParams = {
  leadStatus: LeadStatus;
  onEdit: (leadStatus: LeadStatus) => void;
  onRemove: (leadStatus: LeadStatus) => void;
  onRestore: (leadStatus: LeadStatus) => void;
};

const LeadStatusBox = ({
  leadStatus,
  onEdit,
  onRemove,
  onRestore,
}: TLeadStatusBoxParams) => {
  const colorHex = leadStatus.color ?? "#b4b4b4";
  return (
    <div
      className="flex flex-col gap-4 rounded-md p-3 transition hover:bg-gray-300"
      style={{
        background: colorHex,
        color: getOptimalTextColor(colorHex),
      }}
      key={`leadStatus-box-${leadStatus.id}-${Math.random()}`}
    >
      <div className="px-2 text-xl font-bold">{leadStatus.name}</div>
      <div className="flex flex-row gap-2 px-2 font-normal text-gray-500">
        <IconEdit
          style={{
            color: getOptimalTextColor(colorHex),
          }}
          className="cursor-pointer transition hover:bg-gray-400"
          onClick={() => onEdit(leadStatus)}
        />
      </div>
    </div>
  );
};

type LeadStatusFilters = {
  name: string;
  sort: SortBy;
  includeInactive: boolean;
};

const LeadStatusPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>();
  const [leadStatusTotalCount, setLeadStatusTotalCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { register, getValues } = useForm<LeadStatusFilters>({
    defaultValues: {
      sort: SortBy.NEWER,
      includeInactive: false,
    },
  });

  const getLeadStatuses = async (e?: FormEvent) => {
    e?.preventDefault();
    setLeadStatusTotalCount(undefined);
    setLeadStatuses(undefined);
    const { name, sort, includeInactive } = getValues();
    const response = await fetchData({
      query: `
      query allLeadStatus {
        allLeadStatus(page: ${page}, pageSize: ${pageSize}, filters: {
          companyId: ${session?.user.companyId}
          sort: ${sort},
        }) {
          objects {
          id
          name
          color
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const leadStatuses = response?.data?.allLeadStatus.objects;
    setLeadStatusTotalCount(response?.data.allLeadStatus.total);
    if (!leadStatuses) return;

    setLeadStatuses(leadStatuses);
  };

  const handleLeadStatusEdit = (leadStatus: LeadStatus) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentLeadStatusData: leadStatus,
        currentPanel: "leadStatuses-edit",
      };
    });
  };

  const handleLeadStatusRemove = (leadStatus: LeadStatus) => {
    const removeLeadStatus = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeLeadStatus (id: ${leadStatus.id}) {
        id
        name
        }
        }
        `,
      });
      if (response) {
        toast.success("LeadStatus desativada com sucesso.");
        setLeadStatuses((prev) => {
          if (!prev) return [];
          const _leadStatuses = [...prev];
          const index = _leadStatuses.findIndex(
            (_leadStatus) => _leadStatus.id === leadStatus.id
          );
          const _leadStatus = _leadStatuses[index];
          if (!_leadStatus) return prev;
          const updatedLeadStatus: LeadStatus = {
            ..._leadStatus,
          };

          _leadStatuses[index] = updatedLeadStatus;

          return _leadStatuses;
        });
      } else toast.error("Houve um erro ao desativar a leadStatus.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja apagar a leadStatus: ${leadStatus.name} ?`,
          action: async () => {
            await removeLeadStatus();
          },
          visible: true,
        },
      };
    });
  };

  const handleLeadStatusRestore = async (leadStatus: LeadStatus) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateLeadStatus (updateLeadStatusInput:{
                  id: ${leadStatus.id}
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
      toast.success("LeadStatus reativada com sucesso!");
      setLeadStatuses((prev) => {
        if (!prev) return [];
        const _leadStatuses = [...prev];
        const index = _leadStatuses.findIndex(
          (_leadStatus) => _leadStatus.id === leadStatus.id
        );
        const _leadStatus = _leadStatuses[index];
        if (!_leadStatus) return prev;
        const updatedLeadStatus: LeadStatus = {
          ..._leadStatus,
        };

        _leadStatuses[index] = updatedLeadStatus;

        return _leadStatuses;
      });
    } else toast.error("Houve um erro ao reativar a leadStatus.");
  };

  useEffect(() => {
    getLeadStatuses();
  }, [page]);

  const leadStatusDisplay = useMemo(() => {
    if (!leadStatuses) return;
    const display: JSX.Element[] = [];
    for (const leadStatus of leadStatuses) {
      const leadStatusBox = (
        <LeadStatusBox
          leadStatus={leadStatus}
          onEdit={handleLeadStatusEdit}
          onRemove={handleLeadStatusRemove}
          onRestore={handleLeadStatusRestore}
        ></LeadStatusBox>
      );
      display.push(leadStatusBox);
    }

    return <div className="mt-6 mb-12 grid grid-cols-4 gap-5">{display}</div>;
  }, [leadStatuses]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">
            Lead Status
          </div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() =>
              handlePanelChange("leads-status-create", ctx, router)
            }
          >
            <IconPlus />
            <span>Criar Lead Status</span>
          </PurpleButton>
        </div>

        <div className="mt-4 flex flex-row justify-between gap-6">
          <form onSubmit={getLeadStatuses} className="h-full grow">
            <input
              type="text"
              className="h-full w-full rounded-md border border-slate-300 px-6"
              {...register("name")}
            />
          </form>
          <button
            className="flex flex-row gap-2 rounded-md border border-slate-300 bg-white px-4 py-2"
            onClick={getLeadStatuses}
          >
            <IconSearch />
            <span className="text-sm font-semibold">Buscar</span>
          </button>
        </div>

        {/* <div className="mt-4 flex flex-row justify-between gap-6">
          <div className=" flex flex-row items-center gap-2 rounded-md  font-semibold">
            <input
              type="checkbox"
              className="stroke-3"
              {...register("includeInactive")}
            />
            <span className="text-sm font-semibold">
              Incluir status desativados
            </span>
          </div>
        </div> */}

        <PageSelectDisplay
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={leadStatusTotalCount ?? 0}
        />

        {leadStatuses ? (
          <>{leadStatusDisplay}</>
        ) : (
          <div className="flex min-h-[500px] w-full items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default LeadStatusPanel;
