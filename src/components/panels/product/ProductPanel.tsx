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
import { Product, SortBy } from "~/types/graphql";
import { PageSelectDisplay } from "~/components/minis/PageSelector";
import { useForm } from "react-hook-form";
import { FilterModal, FilterNames } from "~/components/modals/FilterModal";
import { toast } from "react-toastify";
import { ProductTableLine } from "~/components/micros/ProductTableLine";
import { AppFilterInput, AppFilterInputKey } from "~/types/AppFiltersInput";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { stringToBoolean } from "~/helpers/stringToBoolean";
import { FiltersUnitsDisplay } from "~/components/minis/FiltersUnitsDisplay";
import { ExportTableButton } from "~/components/micros/ExportTableButton";

const ProductPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);

  const [products, setProducts] = useState<Product[]>();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productTotalCount, setProductTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterModalVisibility, setFilterModalVisibility] = useState(false);
  const [filters, setFilters] = useState<AppFilterInput>({
    sort: SortBy[router.query.sort as SortBy] ?? SortBy.NEWER,
    includeInactive: stringToBoolean(router.query.includeInactive),
    demandAllConditions: stringToBoolean(router.query.demandAllConditions),
    tags: router.query.tags ? JSON.parse(router.query.tags as string) : [],
  });

  const { register, getValues } = useForm();

  const getProducts = async (e?: FormEvent) => {
    e?.preventDefault();
    const { name } = getValues();

    const { sort, includeInactive, tags, demandAllConditions, category } =
      filters;

    const response = await fetchData({
      query: `
      query products {
        products(page: ${page}, pageSize: ${pageSize}, filters: {
          companyId: ${session?.user.companyId}
          name: "${name}",
          sort: ${sort},
          includeInactive: ${includeInactive ?? false}
          tagIds: [${tags ? tags.map((tag) => tag.id) : ""}]
          demandAllConditions: ${demandAllConditions}
          ${
            category && (category.id as unknown as string) !== "undefined"
              ? `categoryId: ${category.id}`
              : ""
          }
        }) {
          objects {
          id
          name
          value
          sku
          isActive
          tags {
            id
            name
            colorHex
          }
          category {
            id
            name
          }
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const products = response?.data?.products.objects;
    setProductTotalCount(response?.data.products.total);
    if (!products) return;

    setProducts(products);
  };

  useEffect(() => {
    getProducts();
  }, [page, filters]);

  const handleProductEdit = (product: Product) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentProductData: product,
      };
    });
    handlePanelChange("products-edit", ctx, router);
  };

  const handleProductRemove = (product: Product) => {
    const removeProduct = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeProduct (id: ${product.id}) {
        id
        name
        }
        }
        `,
      });

      if (response) {
        toast.success("Produto desativado com sucesso.");
        setProducts((prev) => {
          if (!prev) return [];
          const _products = [...prev];
          const index = _products.findIndex(
            (_product) => _product.id === product.id
          );
          const _product = _products[index];
          if (!_product) return prev;
          const updatedProduct: Product = { ..._product, isActive: false };

          _products[index] = updatedProduct;

          return _products;
        });
      } else toast.error("Houve um erro ao desativar o produto.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja apagar o produto: ${product.name} ?`,
          action: async () => {
            await removeProduct();
          },
          visible: true,
        },
      };
    });
  };

  const handleProductRestore = async (product: Product) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateProduct (updateProductInput:{
                  id: ${product.id}
                  isActive: true
                }) {
                  id
                  name
                  isActive
                }
              }
        `,
    });

    if (response) {
      toast.success("Produto reativado com sucesso!");
      setProducts((prev) => {
        if (!prev) return [];
        const _products = [...prev];
        const index = _products.findIndex(
          (_product) => _product.id === product.id
        );
        const _product = _products[index];
        if (!_product) return prev;
        const updatedProduct: Product = { ..._product, isActive: true };

        _products[index] = updatedProduct;

        return _products;
      });
    } else toast.error("Houve um erro ao reativar o produto.");
  };

  const handleProductSelect = (product: Product, select: boolean) => {
    if (select) setSelectedProducts((prev) => [...prev, product]);
    else
      setSelectedProducts((prev) => prev.filter((pp) => pp.id !== product.id));
  };

  const selectAllItems = () => {
    setSelectedProducts(products ?? []);
  };

  const productDisplay = useMemo(() => {
    if (!products) return;
    const display: JSX.Element[] = [];

    for (const product of products) {
      const isSelected = selectedProducts.some((pp) => pp.id === product.id);
      const productLine = (
        <ProductTableLine
          product={product}
          handleEdit={handleProductEdit}
          handleRemove={handleProductRemove}
          handleRestore={handleProductRestore}
          handleSelect={handleProductSelect}
          isSelected={isSelected}
        ></ProductTableLine>
      );
      display.push(productLine);
    }

    return display;
  }, [products, selectedProducts]);

  return (
    <>
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
        setFilters={setFilters}
        filters={filters}
        extraFilters={[FilterNames.CATEGORY]}
      />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Produtos</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("products-create", ctx, router)}
          >
            <IconPlus />
            <span>Criar produto</span>
          </PurpleButton>
        </div>
        <div className="mt-4 flex flex-row justify-between gap-6">
          <form onSubmit={getProducts} className="h-full grow">
            <input
              type="text"
              className="h-full w-full rounded-md border border-slate-300 px-6"
              placeholder="Pesquisar por nome ou sku..."
              {...register("name")}
            />
          </form>
          <button
            className="flex flex-row gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 transition hover:bg-jpurple hover:text-white"
            onClick={getProducts}
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
          totalCount={productTotalCount}
        />

        <table
          className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll rounded-md  border p-2 "
          id="product-table"
        >
          <thead className="overflow-hidden rounded-t-md  bg-gray-300 text-gray-600">
            <tr className="rounded-md">
              {/* <th className="cursor-pointer rounded-tl-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                <div
                  className="mx-auto h-4 w-4 cursor-pointer rounded-sm border-[2px] "
                  style={{
                    backgroundColor: true ? "#0071ce" : "#b6b6b6",
                    borderColor: true ? "#b2b2b2" : "#b2b2b2",
                  }}
                  onClick={selectAllItems}
                ></div>
              </th> */}
              <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Nome
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                SKU
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Categoria
              </th>
              <th className="cursor-pointer from-[MediumPurple]  to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Valor
              </th>

              <th className="cursor-pointer  from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Tags
              </th>
              <th className="cursor-pointer rounded-tr-md from-[MediumPurple] to-[MediumSlateBlue] px-2 text-start transition active:bg-gradient-to-r">
                Ações
              </th>
            </tr>
          </thead>
          {products && (
            <tbody id="product-table-body" className="border border-gray-400">
              {productDisplay}
            </tbody>
          )}
        </table>
        {!products && (
          <div className="flex min-h-[500px] w-screen items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default ProductPanel;
