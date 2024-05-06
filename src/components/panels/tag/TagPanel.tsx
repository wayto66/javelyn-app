import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  MouseEventHandler,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { ShineButton } from "../../micros/ShineButton";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconEdit,
  IconFilter,
  IconFilters,
  IconLoader2,
  IconPlus,
  IconRestore,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { SortBy, Tag } from "~/types/graphql";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { PageSelectDisplay } from "~/components/minis/PageSelector";
import { useForm } from "react-hook-form";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { toast } from "react-toastify";

type TTagBoxParams = {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onRemove: (tag: Tag) => void;
  onRestore: (tag: Tag) => void;
};

const TagBox = ({ tag, onEdit, onRemove, onRestore }: TTagBoxParams) => {
  const colorHex = tag.isActive ? tag.colorHex : "#b4b4b4";
  return (
    <div
      className="flex flex-col gap-4 rounded-md p-3 opacity-50 transition hover:bg-gray-300"
      style={{
        background: colorHex,
        color: getOptimalTextColor(colorHex),
        opacity: tag.isActive ? 1 : 0.5,
      }}
      key={`tag-box-${tag.id}-${Math.random()}`}
    >
      <div className="px-2 text-xl font-bold">{tag.name}</div>
      <div className="px-2">{tag.description}</div>
      <div className="flex flex-row gap-2 px-2 font-normal text-gray-500">
        <IconEdit
          style={{
            color: getOptimalTextColor(colorHex),
          }}
          className="cursor-pointer transition hover:bg-gray-400"
          onClick={() => onEdit(tag)}
        />
        {tag.isActive ? (
          <IconTrash
            style={{
              color: getOptimalTextColor(colorHex),
            }}
            className="cursor-pointer transition hover:bg-gray-400"
            onClick={() => onRemove(tag)}
          />
        ) : (
          <IconRestore
            style={{
              color: getOptimalTextColor(colorHex),
            }}
            className="cursor-pointer transition hover:bg-gray-400"
            onClick={() => onRestore(tag)}
          />
        )}
        {!tag.isActive && (
          <div className="ml-auto text-xs font-bold text-red-500">
            Desativada
          </div>
        )}
      </div>
    </div>
  );
};

type TagFilters = {
  name: string;
  sort: SortBy;
  includeInactive: boolean;
};

const TagPanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [tags, setTags] = useState<Tag[]>();
  const [tagTotalCount, setTagTotalCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { register, getValues } = useForm<TagFilters>({
    defaultValues: {
      sort: SortBy.NEWER,
      includeInactive: false,
    },
  });

  const getTags = async (e?: FormEvent) => {
    e?.preventDefault();
    setTagTotalCount(undefined);
    setTags(undefined);
    const { name, sort, includeInactive } = getValues();
    const response = await fetchData({
      query: `
      query tags {
                tags(page: ${page}, pageSize: ${pageSize}, filters: {
          name: "${name}",
          companyId: ${session?.user.companyId}
          sort: ${sort},
          includeInactive: ${includeInactive}
        }) {
          objects {
          id
          name
          description
          colorHex
          isActive
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const tags = response?.data?.tags.objects;
    setTagTotalCount(response?.data.tags.total);
    if (!tags) return;

    setTags(tags);
  };

  const handleTagEdit = (tag: Tag) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentTagData: tag,
        currentPanel: "tags-edit",
      };
    });
  };

  const handleTagRemove = (tag: Tag) => {
    const removeTag = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeTag (id: ${tag.id}) {
        id
        name
        }
        }
        `,
      });
      if (response) {
        toast.success("Tag desativada com sucesso.");
        setTags((prev) => {
          if (!prev) return [];
          const _tags = [...prev];
          const index = _tags.findIndex((_tag) => _tag.id === tag.id);
          const _tag = _tags[index];
          if (!_tag) return prev;
          const updatedTag: Tag = { ..._tag, isActive: false };

          _tags[index] = updatedTag;

          return _tags;
        });
      } else toast.error("Houve um erro ao desativar a tag.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja apagar a tag: ${tag.name} ?`,
          action: async () => {
            await removeTag();
          },
          visible: true,
        },
      };
    });
  };

  const handleTagRestore = async (tag: Tag) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateTag (updateTagInput:{
                  id: ${tag.id}
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
      toast.success("Tag reativada com sucesso!");
      setTags((prev) => {
        if (!prev) return [];
        const _tags = [...prev];
        const index = _tags.findIndex((_tag) => _tag.id === tag.id);
        const _tag = _tags[index];
        if (!_tag) return prev;
        const updatedTag: Tag = { ..._tag, isActive: true };

        _tags[index] = updatedTag;

        return _tags;
      });
    } else toast.error("Houve um erro ao reativar a tag.");
  };

  useEffect(() => {
    getTags();
  }, [page]);

  const tagDisplay = useMemo(() => {
    if (!tags) return;
    const display: JSX.Element[] = [];
    for (const tag of tags) {
      const tagBox = (
        <TagBox
          tag={tag}
          onEdit={handleTagEdit}
          onRemove={handleTagRemove}
          onRestore={handleTagRestore}
        ></TagBox>
      );
      display.push(tagBox);
    }

    return <div className="mt-6 mb-12 grid grid-cols-4 gap-5">{display}</div>;
  }, [tags]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 rounded-md">
        <div className="flex flex-row justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Tags</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("tags-create", ctx, router)}
          >
            <IconPlus />
            <span>Criar tag</span>
          </PurpleButton>
        </div>

        <div className="mt-4 flex flex-row justify-between gap-6">
          <form onSubmit={getTags} className="h-full grow">
            <input
              type="text"
              className="h-full w-full rounded-md border border-slate-300 px-6"
              {...register("name")}
            />
          </form>
          <button
            className="flex flex-row gap-2 rounded-md border border-slate-300 bg-white px-4 py-2"
            onClick={getTags}
          >
            <IconSearch />
            <span className="text-sm font-semibold">Buscar</span>
          </button>
        </div>

        <div className="mt-4 flex flex-row justify-between gap-6">
          <div className=" flex flex-row items-center gap-2 rounded-md  font-semibold">
            <input
              type="checkbox"
              className="stroke-3"
              {...register("includeInactive")}
            />
            <span className="text-sm font-semibold">
              Incluir tags desativadas
            </span>
          </div>
        </div>

        <PageSelectDisplay
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={tagTotalCount ?? 0}
        />

        {tags ? (
          <>{tagDisplay}</>
        ) : (
          <div className="flex min-h-[500px] w-full items-center justify-center p-12">
            <IconLoader2 className="animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};

export default TagPanel;
