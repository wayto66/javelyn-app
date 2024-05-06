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
  UpdateTicketInput,
  UpdateTicketProductInput,
  Product,
  Tag,
  TicketProduct,
} from "~/types/graphql";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { ProductSelectionBox } from "~/components/minis/ProductSelectionBox";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { IconError404, IconFaceIdError, IconLoader } from "@tabler/icons-react";

const EditTicketPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const ticket = ctx.data.currentTicketData;

  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    ticket?.tags ? (ticket.tags as Tag[]) : []
  );
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const { register, resetField, setValue, getValues, reset, watch, trigger } =
    useForm<UpdateTicketInput>({
      defaultValues: ticket,
    });

  const updateTicket = async (e: FormEvent) => {
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

    console.log({
      mutation: `
        mutation {
        updateTicket(updateTicketInput: {
        id: ${ticket?.id}
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
    });

    const response = await fetchData({
      mutation: `
        mutation {
        updateTicket(updateTicketInput: {
        id: ${ticket?.id}
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
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      toast.success("Ticket atualizado com sucesso!");
      ctx.setData((prev) => {
        return {
          ...prev,
          currentTicketData: response.data.ticket,
        };
      });
    } else {
      toast.error("Houve um erro ao atualizar o ticket.");
    }
  };

  useEffect(() => {
    if (!ticket) handlePanelChange("tickets", ctx, router);
  }, [ticket]);

  const ticketTotalValue = useMemo(() => {
    const products = getValues("products");
    if (!products) return 0;
    let totalValue = 0;
    for (const product of products) {
      if (!product) continue;
      totalValue += Number(product.amount) * Number(product.value);
    }
    return "R$" + totalValue.toLocaleString("pt-BR");
  }, [watch("products")]);

  if (!ticket)
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
            Editar Ticket
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={updateTicket}>
          <div className="flex flex-row items-end justify-between">
            <div className="text-2xl font-semibold text-jpurple">
              {ticket.lead.name}
            </div>
            <div className="">
              {new Date(ticket.createdAt).toLocaleString("pt-BR")}
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
              Atualizar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditTicketPanel;
