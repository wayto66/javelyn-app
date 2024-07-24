import { EConnectionStatus } from "~/components/minis/ConectionHub";
import {
  Attribute,
  Category,
  Company,
  Lead,
  LeadStatus,
  Product,
  Quote,
  Tag,
  Task,
  TaskCategory,
  Ticket,
  User,
} from "~/types/graphql";

export type TContextData = {
  companyData?: Company | undefined;
  listReloadFunction: (data?: any) => unknown;

  currentPanel: string | undefined;
  contactClientList: any[];
  currentClientData: any;
  user: User | undefined;
  currentLeadData: Lead | undefined;
  currentLeads: Lead[] | undefined;
  attributes: Attribute[] | undefined;
  leadStatus: LeadStatus[] | undefined;
  currentTaskData: Task | undefined;
  currentTagData: Tag | undefined;
  currentQuoteData: Quote | undefined;
  currentProductData: Product | undefined;
  currentTicketData: Ticket | undefined;
  currentCategoryData: Category | undefined;
  currentTaskCategory: TaskCategory | undefined;
  taskTargetDate: Date;
  isLoading: boolean;
  leadFieldsToShow: Record<string, boolean | Record<string, boolean>>;
  kanbanFieldsToShow: Record<string, boolean | Record<string, boolean>>;
  quoteFieldsToShow: Record<string, boolean | Record<string, boolean>>;
  ticketFieldsToShow: Record<string, boolean | Record<string, boolean>>;
  connectionStatus: EConnectionStatus;

  showClientEditBox: boolean;
  showEvaluationEditBox: boolean;
  showGroupEditBox: boolean;
  showGroupCreationBox: boolean;
  showLeadEditBox: boolean;
  showListEditBox: boolean;
  showListCreationBox: boolean;
  showProductEditBox: boolean;
  showTaskEditBox: boolean;
  showTaskConcludeBox: boolean;
  showQuoteEditBox: boolean;

  confirmationModalData: {
    message?: string;
    action?: (v?: any) => any;
    color?: string;
    visible: boolean;
  };
};
