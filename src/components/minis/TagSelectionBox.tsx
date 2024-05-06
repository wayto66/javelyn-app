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
import { fetchData } from "~/handlers/fetchData";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { reactContext } from "~/pages/_app";
import { Tag } from "~/types/graphql";

type TTagSelectionBoxParams = {
  selectedTags: Tag[];
  setSelectedTags: Dispatch<SetStateAction<Tag[]>>;
  selectedTagId: string | undefined;
  setSelectedTagId: Dispatch<SetStateAction<string | undefined>>;
};

export const TagSelectionBox = ({
  selectedTagId,
  selectedTags,
  setSelectedTagId,
  setSelectedTags,
}: TTagSelectionBoxParams) => {
  const [tags, setTags] = useState<Tag[]>();
  const ctx = useContext(reactContext);
  const { data: session } = useSession();

  const getTags = async () => {
    const response = await fetchData({
      query: `
      query tags {
        tags(page: 1, pageSize: 999, filters: {
          includeInactive: false
          companyId: ${session?.user.companyId}
        }) {
          objects {
          id
          name
          description
          colorHex
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    const tags = response?.data?.tags.objects;
    if (!tags) return;
    setTags(tags);
  };

  useEffect(() => {
    void getTags();
  }, []);

  const tagDisplay = useMemo(() => {
    const options: JSX.Element[] = [];
    for (const tag of selectedTags) {
      const option = (
        <button
          type="button"
          data-value={tag.id}
          className={`flex flex-row items-center rounded-md px-3 py-1 font-semibold transition hover:opacity-80`}
          style={{
            backgroundColor: tag.colorHex,
            color: getOptimalTextColor(tag.colorHex),
          }}
          onClick={() => removeTag(tag.id)}
        >
          {tag.name}
          <div className="ml-auto">
            <IconX size={20} />
          </div>
        </button>
      );
      options.push(option);
    }

    return options;
  }, [selectedTags]);

  const tagOptions = useMemo(() => {
    if (!tags) return;
    const options: JSX.Element[] = [];

    for (const tag of tags) {
      if (selectedTags.includes(tag)) continue;
      const option = (
        <option
          key={`tag-option-${tag.id}`}
          value={tag.name}
          data-id={tag.id}
          className={`tag-selection-box-option rounded-md px-3 py-1 transition hover:opacity-80`}
        ></option>
      );
      options.push(option);
    }
    return options;
  }, [tags, selectedTags]);

  const handleAddTag = (tagValue: string | undefined) => {
    const tagOption = document.querySelector(
      `.tag-selection-box-option[value="${tagValue}"]`
    ) as HTMLInputElement;

    const tagId = tagOption?.dataset?.id;

    if (!tagId) return;

    const id = Number(tagId);
    const tag = tags?.find((tag) => tag.id === id);
    if (!tag) return;
    setSelectedTags((prev) => [...prev, tag]);
    setSelectedTagId("");
  };

  const removeTag = (id: number) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  if (!tags)
    return (
      <div className="flex flex-col items-center justify-center">
        <IconLoader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col rounded-md border p-4">
      <div className="relative mb-2 flex flex-row items-stretch gap-3">
        <input
          list="tags"
          className=" grow rounded-md border p-2"
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
        />
        <button
          className="absolute top-0 right-0 flex h-full w-auto items-center justify-center rounded-r-md bg-jpurple px-2 text-white"
          type="button"
          onClick={(e) => handleAddTag(selectedTagId)}
        >
          <IconPlus />
        </button>
        <datalist id="tags">{tagOptions}</datalist>
      </div>
      {tagDisplay.length > 0 && (
        <div className="grid grid-cols-4 gap-4   p-2">{tagDisplay}</div>
      )}
    </div>
  );
};
