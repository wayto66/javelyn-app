import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconDownload,
  IconLoader2,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { IconFilterSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Quote, SortBy } from "~/types/graphql";
import { PageSelectDisplay } from "~/components/minis/PageSelector";
import { useForm } from "react-hook-form";
import { FilterModal, FilterNames } from "~/components/modals/FilterModal";
import { toast } from "react-toastify";
import { QuoteTableLine } from "~/components/micros/QuoteTableLine";
import { AppFilterInput, AppFilterInputKey } from "~/types/AppFiltersInput";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { stringToBoolean } from "~/helpers/stringToBoolean";
import { FiltersUnitsDisplay } from "~/components/minis/FiltersUnitsDisplay";
import { ExportTableButton } from "~/components/micros/ExportTableButton";

const QuotePanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const [quotes, setQuotes] = useState<Quote[]>();
  const [quoteTotalCount, setQuoteTotalCount] = useState<number>(0);
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

  const { register, getValues } = useForm();

  const [pageSize, setPageSize] = useState(25);

  const getQuotes = async (e?: FormEvent) => {
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

    console.log({ products });

    const productIds = products ? products.map((product) => product.id) : "";

    const response = await fetchData({
      query: `
      query quotes {
        quotes(page: ${page}, pageSize: ${pageSize}, filters: {
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
          handledAt
          customFields
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
    const quotes = response?.data?.quotes.objects;
    setQuoteTotalCount(response?.data.quotes.total);
    if (!quotes) return;

    setQuotes(quotes);
  };

  useEffect(() => {
    getQuotes();
  }, [page, filters]);

  const handleQuoteEdit = (quote: Quote) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentQuoteData: quote,
      };
    });
    handlePanelChange("quotes-edit", ctx, router);
  };

  const handleQuoteRemove = (quote: Quote) => {
    const removeQuote = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeQuote (id: ${quote.id}) {
        id
        }
        }
        `,
      });

      if (response) {
        toast.success("Quote desativado com sucesso.");
        setQuotes((prev) => {
          if (!prev) return [];
          const _quotes = [...prev];
          const index = _quotes.findIndex((_quote) => _quote.id === quote.id);
          const _quote = _quotes[index];
          if (!_quote) return prev;
          const updatedQuote: Quote = { ..._quote, isActive: false };

          _quotes[index] = updatedQuote;

          return _quotes;
        });
      } else toast.error("Houve um erro ao desativar o quote.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja apagar o quote: ${quote.id} ?`,
          action: async () => {
            await removeQuote();
          },
          visible: true,
        },
      };
    });
  };

  const handleQuoteRestore = async (quote: Quote) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateQuote (updateQuoteInput:{
                  id: ${quote.id}
                  isActive: true
                }) {
                  id
                  isActive
                }
              }
        `,
    });

    if (response) {
      toast.success("Orçamento reativado com sucesso!");
      setQuotes((prev) => {
        if (!prev) return [];
        const _quotes = [...prev];
        const index = _quotes.findIndex((_quote) => _quote.id === quote.id);
        const _quote = _quotes[index];
        if (!_quote) return prev;
        const updatedQuote: Quote = { ..._quote, isActive: true };

        _quotes[index] = updatedQuote;

        return _quotes;
      });
    } else toast.error("Houve um erro ao reativar o orçamento.");
  };

  const quoteDisplay = useMemo(() => {
    if (!quotes) return;
    const display: JSX.Element[] = [];
    for (const quote of quotes) {
      const quoteLine = (
        <QuoteTableLine
          quote={quote}
          handleEdit={handleQuoteEdit}
          handleRemove={handleQuoteRemove}
          handleRestore={handleQuoteRestore}
        ></QuoteTableLine>
      );
      display.push(quoteLine);
    }

    return display;
  }, [quotes]);

  return (
    <>
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
        setFilters={setFilters}
        filters={filters}
        extraFilters={[FilterNames.PRODUCTS, FilterNames.CREATED_AT]}
      />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Orçamentos</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("quotes-create", ctx, router)}
          >
            <IconPlus />
            <span>Criar Orçamento</span>
          </PurpleButton>
        </div>
        <div className="mt-4 flex flex-row justify-between gap-6">
          <form onSubmit={getQuotes} className="h-full grow">
            <input
              type="text"
              className="h-full w-full rounded-md border border-slate-300 px-6"
              placeholder="Pesquisar por nome do lead..."
              {...register("name")}
            />
          </form>
          <button
            className="flex flex-row gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
            onClick={getQuotes}
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
          <ExportTableButton />
        </div>
        <PageSelectDisplay
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={quoteTotalCount}
        />
        <table
          className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll rounded-md  border p-2 "
          id="quote-table"
        >
          <thead className="overflow-hidden rounded-t-md  bg-gray-300 text-gray-600">
            <tr className="rounded-md">
              <th className="cursor-pointer rounded-tl-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Data
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Lead
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Valor
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Usuário
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Concluído?
              </th>

              <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Tags
              </th>
              <th className="cursor-pointer rounded-tr-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Ações
              </th>
            </tr>
          </thead>
          {quotes && (
            <tbody id="quote-table-body" className="border border-gray-400">
              {quoteDisplay}
            </tbody>
          )}
        </table>
        {!quotes && (
          <div className="flex min-h-[500px] w-full items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default QuotePanel;
