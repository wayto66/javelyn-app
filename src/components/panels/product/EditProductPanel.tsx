import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { useRouter } from "next/router";
import {
  AtributeType,
  Category,
  Tag,
  UpdateProductInput,
} from "~/types/graphql";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { AttributesDisplay } from "~/components/minis/AttributesDisplay";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";

const EditProductPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const { register, getValues, reset, watch, setValue } =
    useForm<UpdateProductInput>({
      defaultValues: {
        id: ctx.data.currentProductData?.id,
        name: ctx.data.currentProductData?.name,
        companyId: ctx.data.currentProductData?.companyId,
        categoryId: ctx.data.currentProductData?.categoryId,
        value: ctx.data.currentProductData?.value,
        sku: ctx.data.currentProductData?.sku,
      },
    });

  const {
    register: customFieldsRegister,
    getValues: customFieldsGetValues,
    setValue: cfSetValue,
    watch: customFieldsWatch,
  } = useForm();

  const getProductInfo = async (e?: FormEvent) => {
    e?.preventDefault();
    const response = await fetchData({
      query: `
      query product {
        product(id: ${ctx.data.currentProductData?.id}) {
          id
          tags {
            id
            name
            colorHex
          }
          customFields
        }
      }
      `,
      token: session?.user.accessToken,
      ctx,
    });
    const tags = response?.data?.product.tags as Tag[];
    const customFields = response?.data.product.customFields;
    if (!tags) return;
    setSelectedTags(tags);
    setValue("customFields", customFields);
  };

  const getCategories = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!session || !session.user) {
      console.error("No session/user found.", session);
      return;
    }
    const response = await fetchData({
      query: `
      query categories {
        categories(page: 1, pageSize: 999, filters: {
          companyId: ${session?.user.companyId}
        }) {
          objects {
          id
          name
          }
          total
        }
      }
      `,
      token: session.user.accessToken,
      ctx,
    });
    const categories = response?.data?.categories.objects;
    if (!categories) return;
    setCategories(categories);
  };

  const updateProduct = async (e: FormEvent) => {
    e.preventDefault();
    const { name, categoryId, value, id, sku } = getValues();
    if (!categoryId) {
      toast.error("Selecione uma categoria para o produto.");
      return;
    }

    const customFields = customFieldsGetValues();

    const response = await fetchData({
      mutation: `
        mutation {
        updateProduct(updateProductInput: {
        id: ${id} 
        name: "${name}"
        sku: "${sku}"
            value: ${value?.toString().replaceAll(",", ".")}
        categoryId: ${categoryId}
        tagsIds: [${selectedTags.map((tag) => tag.id)}]
                customFields: {${jsonToGraphQLString(customFields)}}
        }) {
        name
        id
        categoryId
        companyId
        value
        }
        }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (response) {
      handlePanelChange("products", ctx, router);
      toast.success("Produto atualizado com sucesso!");
      reset();
    } else {
      toast.error("Houve um erro ao atualizado o produto.");
    }
  };

  useEffect(() => {
    if (!ctx.data.currentProductData) {
      handlePanelChange("products", ctx, router);
      return;
    }
    getCategories();
    getProductInfo();
  }, []);

  const leadAttributes = useMemo(() => {
    const customFields = getValues("customFields") ?? [];
    const attributes: any[] = [];
    for (const [key, value] of Object.entries(customFields)) {
      const attribute = {
        name: key,
        value: value,
      };
      attributes.push(attribute);
    }
    return attributes;
  }, [watch("customFields")]);

  const categoryOptions = useMemo(() => {
    const options: JSX.Element[] = [];
    for (const category of categories) {
      const option = <option value={category.id}>{category.name}</option>;
      options.push(option);
    }
    return options;
  }, [categories]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Editando Produto
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={updateProduct}>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Nome</span>
            <input
              type="text"
              className="rounded-lg border px-2 py-1"
              {...register("name")}
              required
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">SKU</span>
            <input
              type="text"
              className="rounded-lg border px-2 py-1"
              {...register("sku")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Categoria</span>
              {categoryOptions?.length > 0 ? (
                <select
                  className="rounded-lg border px-2 py-1"
                  {...register("categoryId")}
                  required
                >
                  {categoryOptions}
                </select>
              ) : (
                <div className="flex flex-row items-center gap-4">
                  <span>Nenhuma categoria encontrada</span>
                  <button
                    className="flex flex-row items-center gap-2 rounded-md bg-jpurple px-3 py-1 text-sm font-semibold text-white transition hover:bg-jpurple/80"
                    type="button"
                    onClick={() =>
                      handlePanelChange("products-category-create", ctx, router)
                    }
                  >
                    <IconPlus size={15} />
                    <span>Criar</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Valor</span>
              <input
                type="text"
                {...register("value")}
                className="rounded-lg border px-2 py-1"
                required
              />
            </div>
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
            register={customFieldsRegister}
            watch={customFieldsWatch}
            type={AtributeType.PRODUCT}
            attributeValues={leadAttributes}
          />

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("products", ctx, router)}
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

export default EditProductPanel;
