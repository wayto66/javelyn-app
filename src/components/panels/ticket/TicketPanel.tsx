import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconDownload,
  IconForms,
  IconLoader2,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { IconFilterSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Ticket, SortBy } from "~/types/graphql";
import { PageSelectDisplay } from "~/components/minis/PageSelector";
import { useForm } from "react-hook-form";
import { FilterModal, FilterNames } from "~/components/modals/FilterModal";
import { toast } from "react-toastify";
import { TicketTableLine } from "~/components/micros/TicketTableLine";
import { AppFilterInput, AppFilterInputKey } from "~/types/AppFiltersInput";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { stringToBoolean } from "~/helpers/stringToBoolean";
import { FiltersUnitsDisplay } from "~/components/minis/FiltersUnitsDisplay";
import { ExportTableButton } from "~/components/micros/ExportTableButton";
import { QuoteFieldChooseModal } from "~/components/modals/QuoteFieldChooseModal";

const TicketPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const fieldsToShow = ctx.data.quoteFieldsToShow;

  const [pageSize, setPageSize] = useState(25);
  const [tickets, setTickets] = useState<Ticket[]>();
  const [ticketTotalCount, setTicketTotalCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [filterModalVisibility, setFilterModalVisibility] = useState(false);
  const [filters, setFilters] = useState<AppFilterInput>({
    sort: SortBy[router.query.sort as SortBy] ?? SortBy.NEWER,
    includeInactive: stringToBoolean(router.query.includeInactive),
    demandAllConditions: stringToBoolean(router.query.demandAllConditions),
    tags: router.query.tags ? JSON.parse(router.query.tags as string) : [],
    products: router.query.products
      ? JSON.parse(router.query.products as string)
      : [],
  });
  const [isFieldChooseModalVisible, setFieldChooseModalVisible] =
    useState(false);

  const { register, getValues } = useForm();

  const getTickets = async (e?: FormEvent) => {
    e?.preventDefault();
    const { name } = getValues();
    const {
      sort,
      includeInactive,
      tags,
      demandAllConditions,
      createdAt,
      products,
    } = filters;

    const productIds = products ? products.map((product) => product.id) : "";

    const response = await fetchData({
      query: `
      query tickets {
        tickets(page: ${page}, pageSize: ${pageSize}, filters: {
          companyId: ${session?.user.companyId}
          name: "${name}",
          sort: ${sort},
          includeInactive: ${includeInactive ?? false}
          tagIds: [${tags ? tags.map((tag) => tag.id) : ""}]
          productIds: [${productIds}] 
          demandAllConditions: ${demandAllConditions}
          dateGt: "${createdAt?.gt ?? ""}"
          dateLt: "${createdAt?.lt ?? ""}"
        }) {
          objects {
          id
          leadId
          userId
          observation
          value
          isActive
          createdAt
          tags {
            id
            name
            colorHex
          }
          lead {
            id
            name
          }
          user {
            id
            name
          }
          products {
            productId
            amount
            value
          }
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const tickets = response?.data?.tickets.objects;
    setTicketTotalCount(response?.data.tickets.total);
    if (!tickets) return;

    setTickets(tickets);
  };

  useEffect(() => {
    getTickets();
  }, [page, filters]);

  const handleTicketEdit = (ticket: Ticket) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentTicketData: ticket,
      };
    });
    handlePanelChange("tickets-edit", ctx, router);
  };

  const handleTicketRemove = (ticket: Ticket) => {
    const removeTicket = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeTicket (id: ${ticket.id}) {
        id
        }
        }
        `,
      });

      if (response) {
        toast.success("Ticket desativado com sucesso.");
        setTickets((prev) => {
          if (!prev) return [];
          const _tickets = [...prev];
          const index = _tickets.findIndex(
            (_ticket) => _ticket.id === ticket.id
          );
          const _ticket = _tickets[index];
          if (!_ticket) return prev;
          const updatedTicket: Ticket = { ..._ticket, isActive: false };

          _tickets[index] = updatedTicket;

          return _tickets;
        });
      } else toast.error("Houve um erro ao desativar o ticket.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja apagar o ticket: ${ticket.id} ?`,
          action: async () => {
            await removeTicket();
          },
          visible: true,
        },
      };
    });
  };

  const handleTicketRestore = async (ticket: Ticket) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateTicket (updateTicketInput:{
                  id: ${ticket.id}
                  isActive: true
                }) {
                  id
                  isActive
                }
              }
        `,
    });

    if (response) {
      toast.success("Ticket reativado com sucesso!");
      setTickets((prev) => {
        if (!prev) return [];
        const _tickets = [...prev];
        const index = _tickets.findIndex((_ticket) => _ticket.id === ticket.id);
        const _ticket = _tickets[index];
        if (!_ticket) return prev;
        const updatedTicket: Ticket = { ..._ticket, isActive: true };

        _tickets[index] = updatedTicket;

        return _tickets;
      });
    } else toast.error("Houve um erro ao reativar o ticket.");
  };

  const openFieldChooseModal = () => setFieldChooseModalVisible(true);
  const closeFieldChooseModal = () => setFieldChooseModalVisible(false);

  const ticketDisplay = useMemo(() => {
    if (!tickets) return;
    const display: JSX.Element[] = [];
    for (const ticket of tickets) {
      const ticketLine = (
        <TicketTableLine
          ticket={ticket}
          handleEdit={handleTicketEdit}
          handleRemove={handleTicketRemove}
          handleRestore={handleTicketRestore}
          fieldsToShow={fieldsToShow}
        ></TicketTableLine>
      );
      display.push(ticketLine);
    }

    return display;
  }, [tickets, fieldsToShow]);

  return (
    <>
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
        setFilters={setFilters}
        filters={filters}
        extraFilters={[FilterNames.PRODUCTS, FilterNames.CREATED_AT]}
      />
      {isFieldChooseModalVisible && (
        <QuoteFieldChooseModal
          closeFieldChooseModal={closeFieldChooseModal}
          reloadQuotes={getTickets}
        />
      )}

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Tickets</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("tickets-create", ctx, router)}
          >
            <IconPlus />
            <span>Criar ticket</span>
          </PurpleButton>
        </div>
        <div className="mt-4 flex flex-row justify-between gap-6">
          <form onSubmit={getTickets} className="h-full grow">
            <input
              type="text"
              className="h-full w-full rounded-md border border-slate-300 px-6"
              placeholder="Pesquisar por nome do lead..."
              {...register("name")}
            />
          </form>
          <button
            className="flex flex-row gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
            onClick={getTickets}
          >
            <IconSearch />
            <span className="text-sm font-semibold">Buscar</span>
          </button>
          <button
            className="flex flex-row gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
            onClick={() => setFilterModalVisibility(true)}
          >
            <IconFilterSearch />
            <span className="text-sm font-semibold">Filtrar</span>
          </button>
        </div>
        <div className="mt-2 flex flex-row justify-between gap-6">
          <FiltersUnitsDisplay filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex flex-row items-center justify-between gap-6">
          <button
            className=" mt-3 flex h-full flex-row items-center gap-2 rounded-md border-b bg-jpurple px-5 py-2 text-sm font-bold text-white shadow-xl transition hover:border-jpurple hover:opacity-80"
            onClick={openFieldChooseModal}
          >
            <IconForms />
            Campos para Exibir
          </button>
          <ExportTableButton />
        </div>
        <PageSelectDisplay
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={ticketTotalCount ?? 0}
        />
        <table
          className=" mt-3 w-full table-auto border-separate border-spacing-2 overflow-scroll  rounded-md "
          id="ticket-table"
        >
          <thead className="overflow-hidden rounded-t-md  bg-gray-300 text-gray-600">
            <tr className="rounded-md">
              {fieldsToShow.date && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Data
                </th>
              )}
              <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
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
              {fieldsToShow.value && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Valor
                </th>
              )}
              {fieldsToShow.user && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Usuário
                </th>
              )}

              {fieldsToShow.tags && (
                <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                  Tags
                </th>
              )}
              <th className="cursor-pointer rounded-tr-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Ações
              </th>
            </tr>
          </thead>
          {tickets && (
            <tbody id="ticket-table-body" className="border border-gray-400">
              {ticketDisplay}
            </tbody>
          )}
        </table>
        {!tickets && (
          <div className="flex min-h-[500px] w-full items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default TicketPanel;
