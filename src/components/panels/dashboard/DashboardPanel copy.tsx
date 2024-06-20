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
  IconSearch,
  IconSend,
  IconTableImport,
  IconTrash,
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

export const DashboardPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const { leadFieldsToShow, quoteFieldsToShow, ticketFieldsToShow } = ctx.data;

  const [leads, setLeads] = useState<Lead[]>();
  const [leadTotalCount, setLeadTotalCount] = useState<number>(0);
  const [filterModalVisibility, setFilterModalVisibility] = useState(false);
  const [fieldsModalVisibility, setFieldsModalVisibility] = useState(false);
  const [filters, setFilters] = useState<AppFilterInput>({
    sort: SortBy[router.query.sort as SortBy] ?? SortBy.NEWER,
    includeInactive: stringToBoolean(router.query.includeInactive),
    demandAllConditions: stringToBoolean(router.query.demandAllConditions),
    tags: router.query.tags ? JSON.parse(router.query.tags as string) : [],
    products: router.query.products
      ? JSON.parse(router.query.products as string)
      : [],
  });

  const { register, getValues } = useForm();

  const getLeads = async (e?: FormEvent) => {
    e?.preventDefault();
    const { searchParameter, searchValue } = getValues();
    const {
      sort,
      includeInactive,
      tags,
      demandAllConditions,
      createdAt,
      products,
      customFilters,
    } = filters;

    const productIds = products ? products.map((product) => product.id) : "";

    const response = await fetchData({
      query: `
      query leads {
        leads(page: 1, pageSize: 99999, filters: {
          companyId: ${session?.user.companyId}
          ${
            session?.user.permissions.seeAllLeads
              ? ""
              : `userId: ${session?.user.id}`
          }
          ${searchParameter}: "${searchValue}",
          sort: ${sort},
          includeInactive: ${includeInactive ?? false}
          tagIds: [${tags ? tags.map((tag) => tag.id) : ""}]
          productIds: [${productIds}] 
          demandAllConditions: ${demandAllConditions}
          dateGt: "${createdAt?.gt ?? ""}"
          dateLt: "${createdAt?.lt ?? ""}"
          customFilters: {${jsonToGraphQLString(customFilters)}}
        }) {
          objects {
          id name phone CPF isActive customFields
          createdAt
          tags {
            id
            name
            colorHex
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
    setLeadTotalCount(response?.data.leads.total);
    if (!leads) return;

    setLeads(leads);
  };

  useEffect(() => {
    if (!session) return;
    getLeads();
  }, [filters, session]);

  return (
    <>
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
        setFilters={setFilters}
        filters={filters}
        extraFilters={[FilterNames.PRODUCTS, FilterNames.CREATED_AT]}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row items-center justify-between">
          <div className="text-5xl font-extrabold tracking-tighter text-jpurple">
            Dashboard
          </div>
          <div className=" flex w-max flex-col items-center justify-center rounded-md p-6 shadow-xl">
            <div className="mb-4 border-b border-gray-800 pb-1 font-semibold text-gray-800">
              Selecione o período:
            </div>
            <div className="flex flex-row gap-12">
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-xs font-semibold">Do dia:</div>
                <input
                  className="rounded-md bg-jpurple p-2 text-white"
                  aria-label="Date"
                  type="date"
                  {...register("dateStart")}
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-xs font-semibold">Até o dia:</div>
                <input
                  className="rounded-md bg-jpurple p-2 text-white"
                  aria-label="Date"
                  type="date"
                  {...register("dateEnd")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-row justify-between gap-6">
          <form onSubmit={getLeads} className="h-full grow">
            <div className="relative h-full w-full rounded-md">
              <input
                type="text"
                className="h-full w-full rounded-md border border-slate-300 px-6"
                placeholder="Pesquisar por..."
                {...register("searchValue")}
              />
              <div className="absolute right-0 top-0 flex h-full items-center justify-center p-2">
                <select
                  {...register("searchParameter")}
                  className="rounded-md border px-2 py-1 "
                >
                  <option value="name">Nome</option>
                  <option value="phone">Telefone</option>
                  <option value="CPF">CPF</option>
                </select>
              </div>
            </div>
          </form>
          <button
            className="flex flex-row items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
            onClick={getLeads}
          >
            <IconSearch />
            <span className="text-sm font-semibold">Buscar</span>
          </button>
          <div className="relative hidden">
            <button
              className="flex flex-row items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
              onClick={() => setFieldsModalVisibility((prev) => !prev)}
            >
              <IconForms />
              <span className="text-sm font-semibold">Campos</span>
            </button>
            {fieldsModalVisibility && (
              <div className="absolute right-0 top-[100%] z-[99] flex min-w-[250px] flex-col gap-2 rounded-b-md bg-gray-200 p-4 shadow-xl">
                <div className="flex flex-row gap-4 border-b border-jpurple p-1">
                  <input type="checkbox" />
                  <span>Entrada</span>
                </div>
                <div className="flex flex-row gap-4 border-b border-jpurple p-1">
                  <input type="checkbox" />
                  <span>CPF</span>
                </div>
                <div className="mt-6 flex flex-row gap-3">
                  <button
                    className="rounded-md bg-red-500 px-3 py-1 text-white transition hover:bg-red-700"
                    onClick={() => setFieldsModalVisibility(false)}
                  >
                    <IconX />
                  </button>
                  <DefaultButton className="grow">Salvar</DefaultButton>
                </div>
              </div>
            )}
          </div>
          <button
            className="flex flex-row items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
            onClick={() => setFilterModalVisibility(true)}
          >
            <IconFilterSearch />
            <span className="text-sm font-semibold">Filtrar</span>
          </button>
        </div>
        <div className="mt-2 flex flex-row justify-between gap-6">
          <FiltersUnitsDisplay filters={filters} setFilters={setFilters} />
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
