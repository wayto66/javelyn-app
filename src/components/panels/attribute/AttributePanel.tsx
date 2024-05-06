import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import PurpleButton from "../../micros/PurpleButton";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDragDrop2,
  IconEdit,
  IconPlus,
  IconRestore,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { handlePanelChange } from "~/helpers/handlePanelChange";
import { Locale } from "~/helpers/Locale";

type Attribute = any;

const AttributeItem = ({
  attribute,
  handleClick,
  handleRemove,
  handleRestore,
}: {
  attribute: Attribute;
  handleClick: (v: Attribute) => void;
  handleRemove: (v: Attribute) => void;
  handleRestore: (v: Attribute) => void;
}) => {
  return (
    <div
      className={`flex w-full flex-row items-center gap-3 rounded-md bg-${
        attribute.isActive ? "gray" : "red"
      }-300 px-6 py-2`}
      style={{
        opacity: attribute.isActive ? 1 : 0.67,
        border: attribute.isActive ? "none" : "1px solid rgba(170,30,30,0.4)",
      }}
    >
      <IconDragDrop2 className="text-gray-500" />
      <span className="ml-10 basis-[30%] font-semibold">{attribute.name}</span>
      <span className="ml-10 basis-[13%] font-semibold">
        {Locale(attribute.valueType)}
      </span>
      <span className="ml-10 font-semibold">{Locale(attribute.types[0])}</span>
      <IconEdit
        className="ml-auto cursor-pointer rounded-md p-1 text-gray-600 transition hover:bg-gray-300"
        onClick={() => handleClick(attribute)}
        size={35}
      />
      {attribute.isActive ? (
        <IconTrash
          className="cursor-pointer select-none rounded-md p-1 text-gray-600 transition hover:bg-gray-300"
          size={35}
          onClick={() => handleRemove(attribute)}
        />
      ) : (
        <IconRestore
          className="cursor-pointer select-none rounded-md p-1 text-gray-600 transition hover:bg-gray-300"
          size={35}
          onClick={() => handleRestore(attribute)}
        />
      )}
    </div>
  );
};

const AttributePanel = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const ctx = useContext(reactContext);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [page, setPage] = useState(1);

  const getAttributes = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!session || !session.user) {
      console.error("No session/user found.", session);
      return;
    }
    const response = await fetchData({
      query: `
      query attributes {
        attributes(page: ${page}, pageSize: 20, filters: {
          includeInactive: true
          companyId: ${session?.user.companyId}
        }) {
          objects {
          id
          name
          observation
          types
          valueType
          isActive
          }
          total
        }
      }
      `,
      token: session.user.accessToken,
      ctx,
    });
    const attributes = response?.data?.attributes.objects;
    if (!attributes) return;

    setAttributes(attributes);
  };

  useEffect(() => {
    getAttributes();
  }, []);

  const handleEdit = (attribute: Attribute) => {
    ctx.setData((prev) => {
      return {
        ...prev,
        currentAttributeData: attribute,
      };
    });
    handlePanelChange("attributes-edit", ctx, router, {
      id: attribute.id,
    });
  };

  const handleRemove = (attribute: Attribute) => {
    const removeAttribute = async () => {
      const response = await fetchData({
        token: session?.user.accessToken,
        ctx,
        mutation: `
        mutation {
        removeAttribute (id: ${attribute.id}) {
        id
        name
        }
        }
        `,
      });

      if (response) {
        toast.success("Atributo desativado com sucesso.");
        setAttributes((prev) => {
          if (!prev) return [];
          const _attributes = [...prev];
          const index = _attributes.findIndex(
            (_attribute) => _attribute.id === attribute.id
          );
          const _attribute = _attributes[index];
          if (!_attribute) return prev;
          const updatedAttribute: Attribute = {
            ..._attribute,
            isActive: false,
          };

          _attributes[index] = updatedAttribute;

          return _attributes;
        });
        ctx.setData((prev) => {
          const _attributes = [...(prev.attributes ?? [])];
          const index = _attributes.findIndex(
            (_attribute) => _attribute.id === response.data.removeAttribute.id
          );
          const _attribute = _attributes[index];
          if (!_attribute) return prev;
          const updatedAttribute: Attribute = {
            ..._attribute,
            isActive: false,
          };

          _attributes[index] = updatedAttribute;

          return {
            ...prev,
            attributes: _attributes,
          };
        });
      } else toast.error("Houve um erro ao desativar o atributo.");
    };

    ctx.setData((prev) => {
      return {
        ...prev,
        confirmationModalData: {
          message: `Tem certeza que deseja desativar o atributo: ${attribute.name} ?`,
          action: async () => {
            await removeAttribute();
          },
          visible: true,
        },
      };
    });
  };

  const handleRestore = async (attribute: Attribute) => {
    const response = await fetchData({
      token: session?.user.accessToken,
      ctx,
      mutation: `
              mutation {
                updateAttribute (updateAttributeInput:{
                  id: ${attribute.id}
                  companyId: ${session?.user.companyId}
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
      toast.success("Atributo reativado com sucesso!");
      setAttributes((prev) => {
        if (!prev) return [];
        const _attributes = [...prev];
        const index = _attributes.findIndex(
          (_attribute) => _attribute.id === attribute.id
        );
        const _attribute = _attributes[index];
        if (!_attribute) return prev;
        const updatedAttribute: Attribute = { ..._attribute, isActive: true };

        _attributes[index] = updatedAttribute;

        return _attributes;
      });
      ctx.setData((prev) => {
        const _attributes = [...(prev.attributes ?? [])];
        const index = _attributes.findIndex(
          (_attribute) => _attribute.id === response.data.updateAttribute.id
        );
        const _attribute = _attributes[index];
        if (!_attribute) return prev;
        const updatedAttribute: Attribute = {
          ..._attribute,
          isActive: true,
        };

        _attributes[index] = updatedAttribute;

        return {
          ...prev,
          attributes: _attributes,
        };
      });
    } else toast.error("Houve um erro ao reativar o atributo.");
  };

  const attributeDisplay = useMemo(() => {
    const display: JSX.Element[] = [];
    for (const attribute of attributes) {
      const attributeLine = (
        <AttributeItem
          handleClick={handleEdit}
          handleRemove={handleRemove}
          handleRestore={handleRestore}
          attribute={attribute}
        ></AttributeItem>
      );
      display.push(attributeLine);
    }

    return display;
  }, [attributes]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-2 rounded-md">
        <div className="flex flex-row items-center justify-between">
          <div className="text-4xl font-extrabold text-jpurple">Atributos</div>
          <PurpleButton
            className="flex flex-row gap-6"
            onClick={() => handlePanelChange("attributes-create", ctx, router)}
          >
            <IconPlus />
            <span>Criar atributo</span>
          </PurpleButton>
        </div>

        <div className="mt-12 flex w-full  text-sm text-gray-500">
          <div className="ml-24 basis-[35%]">Nome</div>
          <div className="basis-[6%]">Tipo</div>
          <div className="basis-[30%] pl-24">Aplicável em</div>
        </div>

        <div className=" flex w-full flex-col gap-2 ">{attributeDisplay}</div>
      </div>
    </>
  );
};

export default AttributePanel;
