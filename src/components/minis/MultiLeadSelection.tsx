import { d } from "@fullcalendar/core/internal-common";
import { IconSearch } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import {
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  useForm,
} from "react-hook-form";
import { toast } from "react-toastify";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "~/pages/_app";
import { Lead } from "~/types/graphql";

type TLeadSelectionParams = {
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
};

export const MultiLeadSelection = ({
  setValue,
  getValues: inputGetValues,
}: TLeadSelectionParams) => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>(
    ctx.data.currentLeads ?? []
  );
  const { register, getValues } = useForm();

  const handleSelectTarget = (lead: Lead) => {
    const leadId = lead.id;
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    setSelectedLeads((prev) => [...(prev ?? []), lead]);
    const prevLeadIds = inputGetValues("leadIds") ?? [];
    const leadIds = [...prevLeadIds, leadId];
    setValue("leadIds", leadIds);
  };

  const handleRemoveTarget = (lead: Lead) => {
    const leadId = lead.id;
    setSelectedLeads((prev) => prev?.filter((lead) => lead.id !== leadId));
    const prevLeadIds: number[] = inputGetValues("leadIds") ?? [];
    const leadIds = prevLeadIds.filter((prevLeadId) => prevLeadId !== leadId);
    setValue("leadIds", leadIds);
  };

  const handleLeadSearch = async () => {
    const { search } = getValues();

    let identifierType: "name" | "phone" = "name";
    if (!isNaN(search)) identifierType = "phone";

    const response = await fetchData({
      query: `
      query leads {
        leads(page: 1, pageSize: 20, filters: {
          ${identifierType}: "${search}"   
          companyId: ${session?.user.companyId}
        }) {
          objects {
          id
          name
          isActive
          }
          total
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });

    if (!response) return;

    const foundLeads = response.data.leads.objects;

    setLeads(foundLeads);
  };

  const foundLeadsDisplay = useMemo(() => {
    return leads.map((lead) => {
      if (!inputGetValues("leadIds")?.includes(lead.id))
        return (
          <div
            key={"lead-" + lead.id}
            className={`flex flex-row items-center gap-2 rounded-md border ${
              lead.isActive ? "bg-white" : "bg-red-200"
            } px-3 py-1`}
          >
            <div
              className="cursor-pointer bg-emerald-500 px-1 py-1 text-xs font-extrabold text-white transition hover:bg-emerald-600"
              onClick={() => {
                handleSelectTarget(lead);
              }}
            >
              ADICIONAR
            </div>
            <div className="text-sm text-slate-500">{lead.name}</div>
            <div className="text-xs text-slate-500">{lead.phone}</div>
            <div className="text-xs font-bold uppercase text-jred">
              {!lead.isActive ? " - LEAD DESATIVADO" : ""}
            </div>
          </div>
        );
    });
  }, [leads]);

  const selectedLeadsDisplay = useMemo(() => {
    if (!selectedLeads) return <></>;
    return selectedLeads.map((lead) => {
      return (
        <div
          key={"lead-" + lead.id}
          className={`flex flex-row items-center gap-2 rounded-md border ${
            lead.isActive ? "bg-white" : "bg-red-200"
          } px-3 py-1`}
        >
          <div
            className="group relative cursor-pointer bg-emerald-500 px-1 py-1 text-xs font-extrabold text-white transition hover:bg-emerald-600"
            onClick={() => {
              handleRemoveTarget(lead);
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 text-white opacity-0 transition group-hover:opacity-100">
              REMOVER
            </div>
            SELECIONADO
          </div>
          <div className="text-sm text-slate-500">{lead.name}</div>
          <div className="text-xs text-slate-500">{lead.phone}</div>
          <div className="text-xs font-bold uppercase text-jred">
            {!lead.isActive ? " - LEAD DESATIVADO" : ""}
          </div>
        </div>
      );
    });
  }, [selectedLeads]);

  return (
    <div className="flex basis-[100%] flex-col gap-2 rounded-md bg-white py-1">
      <div className="">{selectedLeadsDisplay}</div>
      <div className="mt-2 flex w-full flex-row gap-2 rounded-md border">
        <input
          type="text"
          className="grow rounded-md px-3 py-1"
          placeholder="Pesquisar por nome/telefone..."
          {...register("search")}
        />
        <div
          className="cursor-pointer rounded-r-md bg-violet-500 px-2 py-1 text-center text-xl font-extrabold text-white transition hover:bg-violet-600 active:scale-[0.95]"
          onClick={() => {
            handleLeadSearch();
          }}
        >
          <IconSearch />
        </div>
      </div>
      {foundLeadsDisplay}
    </div>
  );
};
