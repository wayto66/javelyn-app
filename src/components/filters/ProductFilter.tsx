import { IconLoader2, IconPlus, IconX } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  UseFormGetValues,
  UseFormRegister,
  UseFormResetField,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { toast } from "react-toastify";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { AppFilterInput } from "~/types/AppFiltersInput";
import {
  CreateTicketInput,
  CreateTicketProductInput,
  Product,
  Ticket,
  TicketProduct,
} from "~/types/graphql";

type TicketProductItemParams = {
  ticketProduct: TicketProduct;
  removeProduct: (id: number) => void;
  register: UseFormRegister<AppFilterInput>;
  setValue: UseFormSetValue<AppFilterInput>;
  index: number;
};

const TicketProductItem = ({
  ticketProduct,
  removeProduct,
  register,
  setValue,
  index,
}: TicketProductItemParams) => {
  const handleRemoveProduct = () => removeProduct(index);

  useEffect(() => {
    setValue(`products.${index}.id`, ticketProduct.productId);
  }, []);

  return (
    <div
      data-value={ticketProduct.productId}
      className={`flex flex-row items-center gap-6 rounded-md bg-gray-100 px-3 py-1  transition hover:opacity-80`}
      key={`ticket-product-item-${ticketProduct.productId}-${Math.random()}`}
    >
      <div className="basis-[35%] text-sm font-semibold">
        {ticketProduct.product.name}
      </div>

      <div
        className="ml-auto cursor-pointer transition hover:bg-gray-200"
        onClick={handleRemoveProduct}
      >
        <IconX size={20} />
      </div>
    </div>
  );
};

type TProductFilterParams = {
  register: UseFormRegister<AppFilterInput>;
  setValue: UseFormSetValue<AppFilterInput>;
  getValues: UseFormGetValues<AppFilterInput>;
  resetField: UseFormResetField<AppFilterInput>;
  watch: UseFormWatch<AppFilterInput>;
};

export const ProductFilter = ({
  register,
  setValue,
  getValues,
  resetField,
  watch,
}: TProductFilterParams) => {
  const [products, setProducts] = useState<Product[]>();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const ctx = useContext(reactContext);
  const { data: session } = useSession();
  const [_, rr] = useState(0);
  const render = () => rr((prev) => prev + 1);

  const getProducts = async () => {
    const response = await fetchData({
      query: `
      query products {
        products(page: 1, pageSize: 999, filters: {
          includeInactive: false
        }) {
          objects {
          id
          name
          value
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const products = response?.data?.products.objects;
    if (!products) return;
    setProducts(products);
  };

  useEffect(() => {
    void getProducts();
  }, []);

  const removeProduct = (id: number) => {
    const ticketProducts = getValues("products");
    if (!ticketProducts || !ticketProducts[id]) return;
    ticketProducts[id]!.id = 0;
    setValue("products", ticketProducts);
    render();
  };

  const productDisplay = useMemo(() => {
    const ticketProducts = getValues("products");
    if (!ticketProducts || !products) return [];
    const options: JSX.Element[] = [];
    for (let i = 0; i < ticketProducts.length; i++) {
      const product = ticketProducts[i];
      if (!product || !product.id || product.id === 0) continue;

      const ticketProductProduct = products.find(
        (prc) => prc.id === product.id
      );
      if (!ticketProductProduct) continue;

      const ticketProduct: TicketProduct = {
        amount: 1,
        productId: product.id,
        id: 0,
        ticketId: 0,
        ticket: {} as Ticket,
        product: ticketProductProduct,
        value: ticketProductProduct.value ?? 0,
      };

      const option = (
        <TicketProductItem
          ticketProduct={ticketProduct}
          removeProduct={removeProduct}
          register={register}
          setValue={setValue}
          index={i}
        ></TicketProductItem>
      );
      options.push(option);
    }

    return options;
  }, [watch("products"), products]);

  const productOptions = useMemo(() => {
    if (!products) return;
    const options: JSX.Element[] = [];

    for (const product of products) {
      const option = (
        <option
          key={`product-option-${product.id}-${Math.random()}`}
          value={product.name}
          data-id={product.id}
          className={`product-selection-box-option rounded-md px-3 py-1 transition hover:opacity-80`}
        ></option>
      );
      options.push(option);
    }
    return options;
  }, [products]);

  const handleAddProduct = (productValue: string | undefined) => {
    const productOption = document.querySelector(
      `.product-selection-box-option[value="${productValue}"]`
    ) as HTMLInputElement;

    const productId = productOption?.dataset?.id;

    if (!productId) return;

    const id = Number(productId);
    const product = products?.find((product) => product.id === id);
    if (!product) return;
    const ticketProduct = {
      id: product.id,
      name: product.name,
    };

    const ticketProducts = getValues("products");
    if (!ticketProducts) {
      setValue("products", []);
      setValue(`products.${0}`, ticketProduct);
    } else {
      ticketProducts[ticketProducts.length] = ticketProduct;
      setValue(`products`, ticketProducts);
    }
    render();
  };

  if (!products)
    return (
      <div className="flex flex-col items-center justify-center">
        <IconLoader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col rounded-md ">
      <div className="text-sm text-slate-700">Filtrar por Produtos</div>
      <div className="relative mb-2 flex flex-row items-stretch gap-3">
        <input
          list="products"
          className=" grow rounded-md border p-2"
          value={selectedProductId}
          onChange={(e) => {
            handleAddProduct(e.target.value);
            setSelectedProductId("");
          }}
        />
        <datalist id="products">{productOptions}</datalist>
      </div>
      {productDisplay.length > 0 && (
        <div className="flex flex-col gap-2">{productDisplay}</div>
      )}
    </div>
  );
};
