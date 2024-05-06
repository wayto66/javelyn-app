import { d } from "@fullcalendar/core/internal-common";
import { IconSearch } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import {
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
  useForm,
} from "react-hook-form";
import { toast } from "react-toastify";
import { fetchData } from "~/handlers/fetchData";
import fetchDbData from "~/helpers/fetchDbData";
import { reactContext } from "~/pages/_app";
import { CreateTicketInput, Lead, UpdateTicketInput } from "~/types/graphql";

type TLeadSelectionParams = {
  setValue: UseFormSetValue<any>;
};

export const LeadSelection = ({ setValue }: TLeadSelectionParams) => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const [leads, setLeads] = useState<Lead[]>([]);
  const { register, getValues } = useForm();

  const handleSelectTarget = (leadId: number) => {
    setLeads((prev) => prev.filter((lead) => lead.id == leadId));
    setValue("leadId", leadId);
  };

  const handleClientSearch = async () => {
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

    if (foundLeads.length === 1) {
      setLeads(foundLeads);
      handleSelectTarget(foundLeads[0].id);
    } else setLeads(foundLeads);
  };

  return (
    <div className="flex basis-[100%] flex-col gap-2 rounded-md bg-white py-1">
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
            handleClientSearch();
          }}
        >
          <IconSearch />
        </div>
      </div>
      {leads.map((lead) => {
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
                handleSelectTarget(lead.id);
              }}
            >
              {leads.length === 1 ? "SELECIONADO" : "SELECIONAR"}
            </div>
            <div className="text-sm text-slate-500">{lead.name}</div>
            <div className="text-xs text-slate-500">{lead.phone}</div>
            <div className="text-xs font-bold uppercase text-jred">
              {!lead.isActive ? " - LEAD DESATIVADO" : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
};
