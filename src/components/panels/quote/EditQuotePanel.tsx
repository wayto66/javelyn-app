import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { useRouter } from "next/router";
import { UpdateQuoteInput, Tag, AtributeType, Quote } from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { ProductSelectionBox } from "~/components/minis/ProductSelectionBox";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { IconError404, IconFaceIdError, IconLoader } from "@tabler/icons-react";
import { AttributesDisplay } from "~/components/minis/AttributesDisplay";
import { Toggle } from "~/components/micros/Toggle";

const EditQuotePanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const quote = ctx.data.currentQuoteData as Quote;

  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    quote?.tags ? (quote.tags as Tag[]) : []
  );
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const { register, resetField, setValue, getValues, reset, watch, trigger } =
    useForm<any>({
      defaultValues: { ...quote, isHandled: quote?.handledAt ? true : false },
    });
  const {
    register: customFieldsRegister,
    getValues: customFieldsGetValues,
    watch: customFieldsWatch,
  } = useForm();

  const updateQuote = async (e: FormEvent) => {
    e.preventDefault();
    const {
      value,
      leadId,
      products: quoteProductsInput,
      observation,
      isHandled,
    } = getValues();
    if (!leadId) {
      toast.error("Selecione um lead para o quote.");
      return;
    }
    if (!quoteProductsInput || quoteProductsInput?.length === 0) {
      toast.error("Selecione ao menos um produto para o quote.");
      return;
    }
    const tagsIds = selectedTags.map((t) => t.id);
    const quoteProducts: {
      amount: string | number;
      value: string | number;
      productId: number;
    }[] = [];
    for (const quoteProduct of quoteProductsInput) {
      if (!quoteProduct?.productId) continue;
      quoteProducts.push({
        amount: Number(quoteProduct.amount),
        productId: quoteProduct.productId,
        value: Number(quoteProduct.value),
      });
    }

    let totalValue = 0;
    for (const product of quoteProducts) {
      totalValue += Number(product.amount) * Number(product.value);
    }

    const customFields = customFieldsGetValues();

    const response = await fetchData({
      mutation: `
        mutation {
        updateQuote(updateQuoteInput: {
        id: ${quote?.id}
        value: ${totalValue}
        leadId: ${leadId}
        companyId: ${session?.user.companyId}
        userId: ${session?.user.id}
        tagsIds: [${tagsIds}]
        observation: "${observation ?? ""}"
        ${jsonToGraphQLString({ products: quoteProducts })}
        customFields: {${jsonToGraphQLString(customFields)}}
        ${isHandled ? `handledAt: "${new Date().toISOString()}"` : ""}

        }) {
         id
          leadId
          userId
          observation
          value
          isActive
          createdAt
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
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("Orçamento atualizado com sucesso!");
      ctx.setData((prev) => {
        return {
          ...prev,
          currentQuoteData: response.data.quote,
        };
      });
    } else {
      toast.error("Houve um erro ao atualizar o orçamento.");
    }
  };

  useEffect(() => {
    if (!quote) handlePanelChange("quotes", ctx, router);
  }, [quote]);

  const quoteTotalValue = useMemo(() => {
    const products = getValues("products");
    if (!products) return 0;
    let totalValue = 0;
    for (const product of products) {
      if (!product) continue;
      totalValue += Number(product.amount) * Number(product.value);
    }
    return "R$" + totalValue.toLocaleString("pt-BR");
  }, [watch("products")]);

  const quoteAttributes = useMemo(() => {
    const customFields = quote?.customFields ?? [];
    const attributes: any[] = [];
    for (const [key, value] of Object.entries(customFields)) {
      const attribute = {
        name: key,
        value: value,
      };
      attributes.push(attribute);
    }
    return attributes;
  }, [quote]);

  if (!quote)
    return (
      <>
        <div className="mx-auto my-auto">
          <div className="flex flex-row gap-2">
            <IconFaceIdError />
            <span className="text-sm text-red-500">
              Um erro inesperado ocorreu...
            </span>
          </div>
        </div>
      </>
    );

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Editar Orçamento
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={updateQuote}>
          <div className="flex flex-row items-end justify-between">
            <div className="text-2xl font-semibold text-jpurple">
              {quote.lead?.name}
            </div>
            <div className="">
              {new Date(quote.createdAt).toLocaleString("pt-BR")}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Produtos</div>
            <ProductSelectionBox
              register={register}
              setValue={setValue}
              resetField={resetField}
              getValues={getValues}
              watch={watch}
            />
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Tags</div>
            <TagSelectionBox
              selectedTagId={selectedTagId}
              selectedTags={selectedTags}
              setSelectedTagId={setSelectedTagId}
              setSelectedTags={setSelectedTags}
            />
          </div>

          <AttributesDisplay
            type={AtributeType.QUOTE}
            register={customFieldsRegister}
            watch={customFieldsWatch}
            attributeValues={quoteAttributes}
          />

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Observação</div>
            <textarea
              {...register("observation")}
              className="rounded-md border p-2"
            ></textarea>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Já foi concluído?</div>
            {quote.handledAt ? (
              <div> {new Date(quote.handledAt).toLocaleString("pt-BR")} </div>
            ) : (
              <Toggle register={register} parameter="isHandled" />
            )}
          </div>

          <div className="mt-2 flex w-full items-center justify-end">
            <div className="flex flex-col">
              <div className="text-2xl font-semibold text-jpurple">
                {quoteTotalValue}
              </div>
              <span className="text-sm">Valor Total</span>
            </div>
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("quotes", ctx, router)}
            >
              Voltar
            </button>
            <button className="rounded-md border bg-jpurple px-5 py-1 font-semibold text-white transition hover:bg-jpurple/80">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditQuotePanel;
