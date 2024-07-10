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
  IconDeviceFloppy,
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
import { Lead, LeadStatus, SortBy } from "~/types/graphql";
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
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { KanbanBoard } from "~/components/kanban/KanbanBoard";
import { ShineButton } from "~/components/micros/ShineButton";
import { KanbanFieldChooseModal } from "~/components/modals/KanbanFieldChooseModal";

export interface LeadFlowChange {
  leadId: number;
  statusId: number | null;
}

const LeadFlow = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const fieldsToShow = ctx.data.leadFieldsToShow;
  const [isFieldChooseModalVisible, setFieldChooseModalVisible] =
    useState(false);
  const [filterModalVisibility, setFilterModalVisibility] = useState(false);

  const [leads, setLeads] = useState<Lead[]>();
  const [leadFlowChanges, setLeadFlowChanges] = useState<LeadFlowChange[]>([]);
  const [changesMade, setChangesMade] = useState(false);

  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
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

  const [pageSize, setPageSize] = useState(25);

  const getLeads = async (e?: FormEvent) => {
    e?.preventDefault();
    const { searchParameter, searchValue } = getValues();
    const { tags } = filters;
    const response = await fetchData({
      query: `
      query leads {
        leads(page: 1, pageSize: ${pageSize}, filters: {
          companyId: ${session?.user.companyId}
          ${
            session?.user.permissions.seeAllLeads
              ? ""
              : `userId: ${session?.user.id}`
          }
          ${searchParameter}: "${searchValue}",
          tagIds: [${tags ? tags.map((tag) => tag.id) : ""}]
        }) {
          objects {
          id name phone CPF isActive customFields mail createdAt observation
          
          tags { id name colorHex }
          status { id name color }
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

  const getLeadStatuses = async (e?: FormEvent) => {
    e?.preventDefault();
    const response = await fetchData({
      query: `
      query allLeadStatus {
        allLeadStatus(page: 1, pageSize: 1111, filters: {
          companyId: ${session?.user.companyId}
        }) {
          objects { id name color }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const leadStatuses = response?.data?.allLeadStatus.objects;
    if (!leadStatuses) return;

    setLeadStatuses(leadStatuses);
  };

  const openFieldChooseModal = () => setFieldChooseModalVisible(true);
  const closeFieldChooseModal = () => setFieldChooseModalVisible(false);

  const handleSaveChanges = async (e: MouseEvent) => {
    const button = e.target as HTMLElement;

    for (const change of leadFlowChanges) {
      const response = await fetchData({
        mutation: `
        mutation($input: UpdateLeadInput!) {
        updateLead(updateLeadInput: $input) {
        id
        name
        }
        }
      `,
        token: session?.user.accessToken ?? "",
        ctx,
        variables: {
          input: {
            id: change.leadId,
            statusId: change.statusId,
          },
        },
      });
    }

    setChangesMade(false);
  };

  useEffect(() => {
    if (!session) return;
    getLeads();
    getLeadStatuses();
  }, [filters, session, pageSize]);

  return (
    <>
      {isFieldChooseModalVisible && (
        <KanbanFieldChooseModal
          closeFieldChooseModal={closeFieldChooseModal}
          isFieldChooseModalVisible={isFieldChooseModalVisible}
          reloadLeads={getLeads}
        />
      )}
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
        setFilters={setFilters}
        filters={filters}
        extraFilters={[FilterNames.PRODUCTS, FilterNames.CREATED_AT]}
      />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Lead Flow</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("leads-create", ctx, router)}
          >
            <IconPlus />
            <span>Criar lead</span>
          </PurpleButton>
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

          <button
            className="flex flex-row items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
            onClick={() => setFilterModalVisibility(true)}
          >
            <IconFilterSearch />
            <span className="text-sm font-semibold">Filtrar</span>
          </button>
        </div>
        <div className="flex items-center gap-6">
          <FiltersUnitsDisplay filters={filters} setFilters={setFilters} />
        </div>
        <div className="mt-2 flex flex-row items-center justify-between gap-6">
          <button
            className="  flex flex-row items-center gap-2 rounded-md border-b bg-jpurple px-5 py-2 text-sm font-bold text-white shadow-xl transition hover:border-jpurple hover:opacity-80"
            onClick={openFieldChooseModal}
          >
            <IconForms />
            Campos para Exibir
          </button>
          <div className="ml-auto flex flex-col">
            <PurpleButton
              className=" flex gap-2"
              disabled={!changesMade}
              onClick={handleSaveChanges}
            >
              <IconDeviceFloppy />
              Salvar
            </PurpleButton>
            {changesMade ? (
              <div className="mt-1 w-full text-center text-xs font-semibold tracking-tight text-red-300">
                Alterações não salvas!
              </div>
            ) : (
              <div className="mt-1 w-full text-center text-xs font-semibold tracking-tight text-emerald-300">
                Tudo certo!
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 mb-12 flex max-w-[90vw] flex-row overflow-x-auto">
        <KanbanBoard
          leads={leads}
          setLeads={setLeads}
          statuses={leadStatuses}
          setChangesMade={setChangesMade}
          setLeadFlowChanges={setLeadFlowChanges}
        />
      </div>
    </>
  );
};

export default LeadFlow;
