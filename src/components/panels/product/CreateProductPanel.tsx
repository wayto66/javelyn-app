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
  AtributeType,
  Category,
  CreateProductInput,
  Tag,
} from "~/types/graphql";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TagSelectionBox } from "~/components/minis/TagSelectionBox";
import { jsonToGraphQLString } from "~/helpers/jsonToGraphQLString";
import { AttributesDisplay } from "~/components/minis/AttributesDisplay";

type TFilterModalParams = {
  visibility: boolean;
  setVisibility: Dispatch<SetStateAction<boolean>>;
};

const FilterModal = ({ visibility, setVisibility }: TFilterModalParams) => {
  const closeModal = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    if ((e.target as HTMLDivElement).id === "filter-overlay")
      setVisibility((prev) => !prev);
  };

  return (
    <>
      {visibility && (
        <div
          className="fixed inset-0 z-[50] h-screen w-screen bg-black/50"
          id="filter-overlay"
          onClick={(e) => closeModal(e)}
        >
          <div className="ml-auto flex h-screen min-w-[30vw] max-w-[50vw] flex-col overflow-y-auto bg-white"></div>
        </div>
      )}
    </>
  );
};

const CreateProductPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>();
  const [filterModalVisibility, setFilterModalVisibility] = useState(false);

  const { register, getValues, reset } = useForm<CreateProductInput>();
  const {
    register: customFieldsRegister,
    getValues: customFieldsGetValues,
    watch: customFieldsWatch,
  } = useForm();

  const handlePanelChange = (panel: string) => {
    ctx?.setData((prev) => {
      return {
        ...prev,
        currentPanel: panel,
      };
    });

    router.push(router.route, {
      query: {
        panel: panel,
      },
    });
  };

  const getCategories = async (e?: FormEvent) => {
    e?.preventDefault();
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
      token: session?.user.accessToken,
      ctx,
    });
    const categories = response?.data?.categories.objects;
    if (!categories) return;
    setCategories(categories);
  };

  const createProduct = async (e: FormEvent) => {
    e.preventDefault();
    const { name, categoryId, value, sku } = getValues();
    if (!categoryId) {
      toast.error("Selecione uma categoria para o produto.");
      return;
    }
    const tagsIds = selectedTags.map((t) => t.id);
    const customFields = customFieldsGetValues();

    const response = await fetchData({
      mutation: `
        mutation {
        createProduct(createProductInput: {
        name: "${name}"
        sku: "${sku}"
           value: ${value?.toString().replaceAll(",", ".")}
        categoryId: ${categoryId}
        companyId: ${session?.user.companyId}
        tagsIds: [${tagsIds}]
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
      toast.success("Produto criado com sucesso!");
      reset();
    } else {
      toast.error("Houve um erro ao criar o produto.");
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

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
      <FilterModal
        visibility={filterModalVisibility}
        setVisibility={setFilterModalVisibility}
      />
      <div className="mx-auto flex w-full max-w-[750px] flex-col gap-2 rounded-md border bg-white p-4">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-extrabold text-jpurple">
            Criar Produto
          </div>
        </div>

        <form className="mt-12 flex flex-col gap-4" onSubmit={createProduct}>
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
                      handlePanelChange("products-category-create")
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
            type={AtributeType.PRODUCT}
            register={customFieldsRegister}
            watch={customFieldsWatch}
          />

          <div className="mt-8 flex flex-row items-center justify-end gap-4">
            <button
              type="button"
              className="rounded-md border px-5 py-1 transition hover:bg-black/10"
              onClick={() => handlePanelChange("products")}
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

export default CreateProductPanel;
