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

const LeadPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const fieldsToShow = ctx.data.leadFieldsToShow;

  const [leads, setLeads] = useState<Lead[]>();
  const [leadTotalCount, setLeadTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [isSheetImportModalVisible, setSheetImportModalVisible] =
    useState(false);
  const [isFieldChooseModalVisible, setFieldChooseModalVisible] =
    useState(false);
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

  const [pageSize, setPageSize] = useState(25);

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
        leads(page: ${page}, pageSize: ${pageSize}, filters: {
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
          id name phone CPF isActive customFields mail
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
  }, [page, filters, session, pageSize]);

  const handleLeadEdit = (lead: Lead) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentLeadData: lead,
      };
    });
    handlePanelChange("leads-edit", ctx, router);
  };

  const handleLeadRemove = (lead: Lead) => {
    const removeLead = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeLead (id: ${lead.id}) {
        id
        }
        }
        `,
      });

      if (response) {
        toast.success("Lead desativado com sucesso.");
        setLeads((prev) => {
          if (!prev) return [];
          const _leads = [...prev];
          const index = _leads.findIndex((_lead) => _lead.id === lead.id);
          const _lead = _leads[index];
          if (!_lead) return prev;
          const updatedLead: Lead = { ..._lead, isActive: false };

          _leads[index] = updatedLead;

          return _leads;
        });
      } else toast.error("Houve um erro ao desativar o lead.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja apagar o lead: ${lead.id} ?`,
          action: async () => {
            await removeLead();
          },
          visible: true,
        },
      };
    });
  };

  const handleLeadRestore = async (lead: Lead) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateLead (updateLeadInput:{
                  id: ${lead.id}
                  isActive: true
                }) {
                  id
                  isActive
                }
              }
        `,
    });

    if (response) {
      toast.success("Lead reativado com sucesso!");
      setLeads((prev) => {
        if (!prev) return [];
        const _leads = [...prev];
        const index = _leads.findIndex((_lead) => _lead.id === lead.id);
        const _lead = _leads[index];
        if (!_lead) return prev;
        const updatedLead: Lead = { ..._lead, isActive: true };

        _leads[index] = updatedLead;

        return _leads;
      });
    } else toast.error("Houve um erro ao reativar o lead.");
  };

  const handleThrow = () => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentLeads: leads,
      };
    });
    handlePanelChange("contact", ctx, router);
  };

  const handleCreateTask = () => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentLeads: leads,
      };
    });
    handlePanelChange("tasks-create", ctx, router);
  };

  const openSheetImportModal = () => setSheetImportModalVisible(true);
  const closeSheetImportModal = () => setSheetImportModalVisible(false);

  const openFieldChooseModal = () => setFieldChooseModalVisible(true);
  const closeFieldChooseModal = () => setFieldChooseModalVisible(false);

  const leadDisplay = useMemo(() => {
    if (!leads) return;
    const display: JSX.Element[] = [];
    for (const lead of leads) {
      const leadLine = (
        <LeadTableLine
          lead={lead}
          handleEdit={handleLeadEdit}
          handleRemove={handleLeadRemove}
          handleRestore={handleLeadRestore}
          fieldsToShow={fieldsToShow}
        ></LeadTableLine>
      );
      display.push(leadLine);
    }

    return display;
  }, [leads, fieldsToShow]);

  return (
    <>
      {isSheetImportModalVisible && (
        <SheetImportModal
          closeSheetImportModal={closeSheetImportModal}
          reloadLeads={getLeads}
        />
      )}
      {isFieldChooseModalVisible && (
        <LeadFieldChooseModal
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
          <div className="text-4xl font-extrabold text-jpurple">Leads</div>
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
        <div className="flex flex-row-reverse items-center justify-between">
          <div className="flex flex-row items-end   gap-4">
            <button
              className="flex h-full flex-row items-center gap-2 rounded-md border-b px-5 py-2 text-sm font-bold text-jpurple shadow-xl transition hover:border-jpurple hover:opacity-80"
              onClick={handleThrow}
            >
              <IconSend />
              Arremessar
            </button>
            <button
              className="flex h-full flex-row items-center gap-2 rounded-md border-b px-5 py-2 text-sm font-bold text-jpurple shadow-xl transition hover:border-jpurple hover:opacity-80"
              onClick={handleCreateTask}
            >
              <IconClipboardPlus />
              Criar Tarefa
            </button>
            <button
              className="ml-auto flex h-full flex-row items-center gap-2 rounded-md border-b px-5 py-2 text-sm font-bold text-jpurple shadow-xl transition hover:border-jpurple hover:opacity-80"
              onClick={openSheetImportModal}
            >
              <IconTableImport />
              Importar Planilha
            </button>
            <ExportTableButton />
          </div>
          <button
            className=" mt-3 flex h-full flex-row items-center gap-2 rounded-md border-b bg-jpurple px-5 py-2 text-sm font-bold text-white shadow-xl transition hover:border-jpurple hover:opacity-80"
            onClick={openFieldChooseModal}
          >
            <IconForms />
            Campos para Exibir
          </button>
        </div>
        <PageSelectDisplay
          page={page}
          setPage={setPage}
          setPageSize={setPageSize}
          pageSize={pageSize}
          totalCount={leadTotalCount}
        />
        <table
          className="mt-3 w-full table-auto border-separate border-spacing-x-2 border-spacing-y-2 overflow-scroll rounded-md "
          id="lead-table"
        >
          <thead className="overflow-hidden rounded-t-md  bg-gray-300 text-gray-600">
            <tr className="rounded-md">
              {fieldsToShow.date && (
                <th className="cursor-pointer rounded-tl-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Entrada
                </th>
              )}
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Nome
              </th>
              {fieldsToShow.CPF && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  CPF
                </th>
              )}
              {fieldsToShow.phone && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Telefone
                </th>
              )}
              {fieldsToShow.mail && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Email
                </th>
              )}
              {fieldsToShow.tags && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Tags
                </th>
              )}
              {Object.entries(fieldsToShow ?? {}).map(([key, value]) => {
                if (typeof value !== "boolean")
                  return Object.entries(value ?? {})
                    .filter(([key, value]) => value !== false)
                    .map(([key, value]) => {
                      return (
                        <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                          {key}
                        </th>
                      );
                    });
              })}

              <th className="cursor-pointer rounded-tr-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Ações
              </th>
            </tr>
          </thead>
          {leads && (
            <tbody id="lead-table-body" className="border border-gray-400">
              {leadDisplay}
            </tbody>
          )}
        </table>
        {!leads && (
          <div className="flex min-h-[500px] w-full items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default LeadPanel;
