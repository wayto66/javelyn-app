import {
  FormEvent,
  MouseEvent,
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
  IconClipboardPlus,
  IconDownload,
  IconForms,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSend,
  IconTableImport,
  IconTrash,
  IconUser,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import { IconFilterSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Lead, SortBy } from "~/types/graphql";
import { PageSelectDisplay } from "~/components/minis/PageSelector";
import { useForm } from "react-hook-form";
import { FilterModal, FilterNames } from "~/components/modals/FilterModal";
import { toast } from "react-toastify";
import { LeadTableLine } from "~/components/micros/LeadTableLine";
import { AppFilterInput, AppFilterInputKey } from "~/types/AppFiltersInput";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { stringToBoolean } from "~/helpers/stringToBoolean";
import { FiltersUnitsDisplay } from "~/components/minis/FiltersUnitsDisplay";
import { ExportTableButton } from "~/components/micros/ExportTableButton";
import { SheetImportModal } from "~/components/modals/SheetImportModal";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { DefaultButton } from "~/components/micros/DefaultButton";
import { LeadFieldChooseModal } from "~/components/modals/LeadFieldChooseModal";
import { Locale } from "~/helpers/Locale";
import DatePicker from "react-date-picker";
import LeadsByTagChart from "~/components/charts/LeadsByTagChart";
import { LeadsByDayChart } from "~/components/charts/LeadsByDayChart";

export interface IDashboardFormParams {
  dateGt: Date;
  dateLt: Date;
}

export const DashboardPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const [leads, setLeads] = useState<Lead[]>();
  const mock = {};

  const { register, getValues } = useForm<IDashboardFormParams>();

  const getLeads = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!session?.user.companyId) return;

    const response = await fetchData({
      query: `
      query leads {
        leads(page: 1, pageSize: 99999, filters: {
          companyId: ${session.user.companyId}
          ${
            session.user.permissions.seeAllLeads
              ? ""
              : `userId: ${session.user.id}`
          }
        }) {
          objects {
          id name phone CPF isActive customFields
          createdAt
          tags {
            id name colorHex
          }
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const leads = response?.data?.leads.objects;
    if (!leads) return;
    setLeads(leads);
  };

  const getData = async () => {
    void getLeads();
  };

  useEffect(() => {
    if (!session) return;
    getData();
  }, [session]);

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row items-center justify-between">
          <div className="text-5xl font-extrabold tracking-tighter text-jpurple">
            Dashboard
          </div>
          <div className=" flex w-max flex-col items-center justify-center rounded-md p-6 shadow-xl">
            <div className="mb-4 border-b border-gray-800 pb-1 font-semibold text-gray-800">
              Selecione o período:
            </div>
            <div className="flex flex-row items-center gap-12">
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-xs font-semibold">Do dia:</div>
                <input
                  className="rounded-md bg-jpurple p-2 text-white"
                  aria-label="Date"
                  type="date"
                  {...register("dateGt")}
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-xs font-semibold">Até o dia:</div>
                <input
                  className="rounded-md bg-jpurple p-2 text-white"
                  aria-label="Date"
                  type="date"
                  {...register("dateLt")}
                />
              </div>
              <button
                className="mt-auto h-max rounded-md bg-jpurple px-3 py-1 text-white transition hover:opacity-80"
                onClick={getData}
              >
                <IconRefresh />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-24 grid w-full grid-cols-4 gap-12">
          <div className="flex flex-col rounded-md bg-white  shadow-xl">
            <div className="  flex flex-row rounded-t-md bg-secondary py-2 px-5 font-semibold text-white">
              <IconUser />
              <div className="ml-auto font-bold">Leads</div>
            </div>
            <div className="flex flex-col p-6">
              <div className="font-semibold">Lorem, ipsum dolor.</div>
              <div className="">Lorem ipsum dolor sit amet.</div>
            </div>
          </div>
          {leads && <LeadsByTagChart leads={leads} />}
          {leads && (
            <LeadsByDayChart
              viewType={"monthly"}
              leads={leads}
              className="col-span-3"
            />
          )}
        </div>

        {!leads && (
          <div className="flex min-h-[500px] w-full items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};
