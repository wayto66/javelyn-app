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
  CreateTicketInput,
  CreateTicketProductInput,
  Product,
  Tag,
  TicketProduct,
} from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { LeadSelection } from "~/components/minis/LeadSelection";
import { ProductSelectionBox } from "~/components/minis/ProductSelectionBox";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { handlePanelChange } from "~/helpers/handlePanelChange";

const CreateTicketPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const { register, resetField, setValue, getValues, reset, watch, trigger } =
    useForm<CreateTicketInput>();

  const createTicket = async (e: FormEvent) => {
    e.preventDefault();
    const {
      value,
      leadId,
      products: ticketProductsInput,
      observation,
    } = getValues();
    if (!leadId) {
      toast.error("Selecione um lead para o ticket.");
      return;
    }
    if (!ticketProductsInput || ticketProductsInput?.length === 0) {
      toast.error("Selecione ao menos um produto para o ticket.");
      return;
    }
    const tagsIds = selectedTags.map((t) => t.id);
    const ticketProducts: {
      amount: string | number;
      value: string | number;
      productId: number;
    }[] = [];
    for (const ticketProduct of ticketProductsInput) {
      if (!ticketProduct?.productId) continue;
      ticketProducts.push({
        amount: Number(ticketProduct.amount),
        productId: ticketProduct.productId,
        value: Number(ticketProduct.value),
      });
    }

    let totalValue = 0;
    for (const product of ticketProducts) {
      totalValue += Number(product.amount) * Number(product.value);
    }

    const response = await fetchData({
      mutation: `
        mutation {
        createTicket(createTicketInput: {
        value: ${totalValue}
        leadId: ${leadId}
        companyId: ${session?.user.companyId}
        userId: ${session?.user.id}
        tagsIds: [${tagsIds}]
        observation: "${observation ?? ""}"
        ${jsonToGraphQLString({ products: ticketProducts })}

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
      toast.success("Ticket criado com sucesso!");
      reset();
    } else {
      toast.error("Houve um erro ao criar o ticket.");
    }
  };

  const ticketTotalValue = useMemo(() => {
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
            Criar Ticket
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={createTicket}>
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
                {ticketTotalValue}
              </div>
              <span className="text-sm">Valor Total</span>
            </div>
          </div>

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("tickets", ctx, router)}
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

export default CreateTicketPanel;
