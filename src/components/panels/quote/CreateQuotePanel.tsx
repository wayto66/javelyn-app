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
import {
  Category,
  CreateQuoteInput,
  CreateQuoteProductInput,
  Product,
  Tag,
  QuoteProduct,
  AtributeType,
} from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { LeadSelection } from "~/components/minis/LeadSelection";
import { ProductSelectionBox } from "~/components/minis/ProductSelectionBox";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { AttributesDisplay } from "~/components/minis/AttributesDisplay";

const CreateQuotePanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const { register, resetField, setValue, getValues, reset, watch, trigger } =
    useForm<CreateQuoteInput>();
  const {
    register: customFieldsRegister,
    getValues: customFieldsGetValues,
    watch: customFieldsWatch,
  } = useForm();

  const createQuote = async (e: FormEvent) => {
    e.preventDefault();
    const {
      value,
      leadId,
      products: quoteProductsInput,
      observation,
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
        createQuote(createQuoteInput: {
        value: ${totalValue}
        leadId: ${leadId}
        companyId: ${session?.user.companyId}
        userId: ${session?.user.id}
        tagsIds: [${tagsIds}]
        observation: "${observation ?? ""}"
        ${jsonToGraphQLString({ products: quoteProducts })}
        customFields: {${jsonToGraphQLString(customFields)}}

        }) {
        id
        leadId
        companyId
        userId
        value
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("Orçamento criado com sucesso!");
      reset();
    } else {
      toast.error("Houve um erro ao criar o orçamento.");
    }
  };

  const quoteTotalValue = useMemo(() => {
    const products = getValues("products");
    if (!products) return 0;
    let totalValue = 0;
    for (const product of products) {
      if (!product) continue;
      totalValue += Number(product.amount) * Number(product.value);
    }
    return "R$" + totalValue.toLocaleString("pt-BR");
  }, [watch(["products", "products.0", "products.1"])]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Criar Orçamento
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={createQuote}>
          <LeadSelection setValue={setValue} />

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
          />

          <div className="flex flex-col">
            <div className="text-sm text-gray-500">Observação</div>
            <textarea
              {...register("observation")}
              className="rounded-md border p-2"
            ></textarea>
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
              Criar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateQuotePanel;
