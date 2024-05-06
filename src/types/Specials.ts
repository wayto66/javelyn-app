import { Group } from "three";
import { Client, List } from "whatsapp-web.js";
import {
  Company,
  Lead,
  Product,
  Quote,
  Task,
  Throw,
  Ticket,
  User,
} from "./graphql";

export type Quote_ = Quote & {
  lead?: Lead;
  client?: Client;
  creator?: User;
  products: Product[];
  tasks: Task[];
  ticket?: Ticket;
};

export type Client_ = Client & {
  lead?: Lead;
  tickets?: Ticket[];
  groups?: Group[];
  sentLists?: List[];
  pendingLists?: List[];
  responsibleUser?: User;
  events?: Event[];
  targetedThrows?: Throw[];
  targetedTasks?: Task[];
  assignedQuotes?: Quote[];
  evaluations?: any[];
  company?: Company;
};

export type Lead_ = Lead & {
  events?: Event[];
  targetedThrows?: Throw[];
  targetedTasks?: Task[];
  assignedQuotes?: Quote[];
  evaluations?: any[];
  creator?: User;
  company?: Company;
  assignee?: User;
};

export type Task_ = Task & {
  targets?: Client[];
  leadTargets?: Lead[];
  quotes?: Quote[];
  creatorUser?: User;
  company?: Company;
};

export type Evaluation_ = any & {
  lead?: Lead;
  client?: Client;
  rescheduledEvaluation?: Evaluation_;
};

export type Group_ = Group & {
  creator: User;
  clients: Client[];
  assignedUsers: User[];
};

export type User_ = User & {
  company: Company;
  createdTickets: Ticket[];
  assignedTickets: Ticket[];
  createdGroups: Group[];
  assignedGroups: Group[];
  createdLists: List[];
  throws: Throw[];
  clients: Client[];
  tasks: Task[];
  createdQuotes: Quote[];
  createdLead: Lead[];
  assignedLeads: Lead[];
  createdEvaluations: any[];
};

export type Ticket_ = Ticket & {
  client: Client;
  creatorUser: User;
};
