/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum AtributeType {
  LEAD = "LEAD",
  QUOTE = "QUOTE",
  TICKET = "TICKET",
  PRODUCT = "PRODUCT",
}

export enum AtributeValueType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  STRING_ARRAY = "STRING_ARRAY",
  NUMBER_ARRAY = "NUMBER_ARRAY",
  JSON = "JSON",
}

export enum SortBy {
  CHEAPER = "CHEAPER",
  COSTLIER = "COSTLIER",
  NEWER = "NEWER",
  OLDER = "OLDER",
  AZ = "AZ",
  ZA = "ZA",
}

export interface CreateAttributeInput {
  companyId: number;
  userId: number;
  name: string;
  observation?: Nullable<string>;
  types: Nullable<AtributeType>[];
  valueType: AtributeValueType;
}

export interface UpdateAttributeInput {
  id: number;
  companyId?: Nullable<number>;
  name?: Nullable<string>;
  observation?: Nullable<string>;
  types?: Nullable<Nullable<AtributeType>[]>;
  valueType?: Nullable<AtributeValueType>;
  isActive?: Nullable<boolean>;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface CreateCategoryInput {
  companyId: number;
  name: string;
}

export interface UpdateCategoryInput {
  id: number;
  name: string;
  companyId: number;
}

export interface CreateCompanyInput {
  name: string;
  email?: Nullable<string>;
  phone?: Nullable<string>;
  plan?: Nullable<string>;
  max_whatsapp_slots?: Nullable<number>;
  whatsapp_slots?: Nullable<number>;
  is_active?: Nullable<boolean>;
  customFields?: Nullable<CustomScalar>;
}

export interface UpdateCompanyInput {
  id: number;
  name?: Nullable<string>;
  email?: Nullable<string>;
  phone?: Nullable<string>;
  plan?: Nullable<string>;
  max_whatsapp_slots?: Nullable<number>;
  whatsapp_slots?: Nullable<number>;
  is_active?: Nullable<boolean>;
  customFields?: Nullable<CustomScalar>;
}

export interface CreateLeadInput {
  companyId: number;
  userId: number;
  name: string;
  CPF?: Nullable<string>;
  phone?: Nullable<string>;
  mail?: Nullable<string>;
  adOrigin?: Nullable<string>;
  status?: Nullable<string>;
  observation?: Nullable<string>;
  customFields?: Nullable<CustomScalar>;
  age?: Nullable<number>;
  neighborhood?: Nullable<string>;
  adress?: Nullable<string>;
  zipCode?: Nullable<string>;
  houseNumber?: Nullable<number>;
  profession?: Nullable<string>;
  birthday?: Nullable<DateTime>;
  birthdayDay?: Nullable<number>;
  birthdayMonth?: Nullable<number>;
  birthdayYear?: Nullable<number>;
  isRescue?: Nullable<boolean>;
  isActive?: Nullable<boolean>;
  tagsIds?: Nullable<Nullable<number>[]>;
}

export interface CreateLeadsInput {
  leads: CreateLeadInput[];
}

export interface UpdateLeadInput {
  id: number;
  companyId?: Nullable<number>;
  userId?: Nullable<number>;
  name?: Nullable<string>;
  CPF?: Nullable<string>;
  phone?: Nullable<string>;
  mail?: Nullable<string>;
  adOrigin?: Nullable<string>;
  status?: Nullable<string>;
  observation?: Nullable<string>;
  age?: Nullable<number>;
  neighborhood?: Nullable<string>;
  customFields?: Nullable<CustomScalar>;
  adress?: Nullable<string>;
  zipCode?: Nullable<string>;
  houseNumber?: Nullable<number>;
  profession?: Nullable<string>;
  birthday?: Nullable<DateTime>;
  birthdayDay?: Nullable<number>;
  birthdayMonth?: Nullable<number>;
  birthdayYear?: Nullable<number>;
  isRescue?: Nullable<boolean>;
  isActive?: Nullable<boolean>;
  tagsIds?: Nullable<Nullable<number>[]>;
}

export interface FiltersInput {
  userId?: Nullable<number>;
  companyId?: Nullable<number>;
  filterId?: Nullable<number>;
  tagIds?: Nullable<Nullable<number>[]>;
  productIds?: Nullable<Nullable<number>[]>;
  categoryId?: Nullable<number>;
  categoryName?: Nullable<string>;
  name?: Nullable<string>;
  CPF?: Nullable<string>;
  phone?: Nullable<string>;
  sort?: Nullable<SortBy>;
  includeInactive?: Nullable<boolean>;
  includeHandled?: Nullable<boolean>;
  demandAllConditions?: Nullable<boolean>;
  dateGt?: Nullable<string>;
  dateLt?: Nullable<string>;
}

export interface CreateProductInput {
  companyId: number;
  sku: string;
  categoryId: number;
  tagsIds?: Nullable<Nullable<number>[]>;
  name: string;
  value?: Nullable<number>;
  customFields?: Nullable<CustomScalar>;
}

export interface UpdateProductInput {
  id: number;
  sku?: Nullable<string>;
  companyId?: Nullable<number>;
  categoryId?: Nullable<number>;
  tagsIds?: Nullable<Nullable<number>[]>;
  name?: Nullable<string>;
  value?: Nullable<number>;
  isActive?: Nullable<boolean>;
  customFields?: Nullable<CustomScalar>;
}

export interface QuoteProductInput {
  productId: number;
  value: number;
  amount: number;
}

export interface CreateQuoteInput {
  companyId: number;
  userId: number;
  leadId: number;
  ticketId?: Nullable<number>;
  observation?: Nullable<string>;
  value: number;
  products?: Nullable<Nullable<QuoteProductInput>[]>;
  tagsIds?: Nullable<Nullable<number>[]>;
  customFields?: Nullable<CustomScalar>;
}

export interface UpdateQuoteInput {
  id: number;
  companyId?: Nullable<number>;
  userId?: Nullable<number>;
  leadId?: Nullable<number>;
  ticketId?: Nullable<number>;
  observation?: Nullable<string>;
  value?: Nullable<number>;
  products?: Nullable<Nullable<QuoteProductInput>[]>;
  tagsIds?: Nullable<Nullable<number>[]>;
  handledAt?: Nullable<DateTime>;
  isActive?: Nullable<boolean>;
  customFields?: Nullable<CustomScalar>;
}

export interface CreateQuoteProductInput {
  productId: number;
  quoteId: number;
  amount: number;
  value: number;
}

export interface UpdateQuoteProductInput {
  id: number;
  productId: number;
  quoteId: number;
  amount: number;
  value: number;
}

export interface CreateRoleInput {
  companyId: number;
  name: string;
  permissions?: Nullable<JSON>;
  isActive: boolean;
}

export interface UpdateRoleInput {
  id: number;
  companyId: number;
  name: string;
  permissions?: Nullable<JSON>;
  isActive: boolean;
}

export interface CreateTagInput {
  companyId: number;
  name: string;
  colorHex: string;
  description?: Nullable<string>;
}

export interface UpdateTagInput {
  id: number;
  companyId?: Nullable<number>;
  name?: Nullable<string>;
  colorHex?: Nullable<string>;
  description?: Nullable<string>;
  quotesIds?: Nullable<Nullable<number>[]>;
  leadsIds?: Nullable<Nullable<number>[]>;
  ticketsIds?: Nullable<Nullable<number>[]>;
  productsIds?: Nullable<Nullable<number>[]>;
  isActive?: Nullable<boolean>;
}

export interface CreateTaskInput {
  companyId: number;
  userId: number;
  title: string;
  body: string;
  observation?: Nullable<string>;
  conclusion?: Nullable<string>;
  categoryId: number;
  leadIds: Nullable<number>[];
  quoteIds?: Nullable<Nullable<number>[]>;
  taskIds?: Nullable<Nullable<number>[]>;
  targetDate: DateTime;
}

export interface UpdateTaskInput {
  id: number;
  companyId?: Nullable<number>;
  userId?: Nullable<number>;
  title?: Nullable<string>;
  body?: Nullable<string>;
  observation?: Nullable<string>;
  conclusion?: Nullable<string>;
  categoryId?: Nullable<number>;
  leadIds?: Nullable<Nullable<number>[]>;
  quoteIds?: Nullable<Nullable<number>[]>;
  taskIds?: Nullable<Nullable<number>[]>;
  isHandled?: Nullable<boolean>;
  isActive?: Nullable<boolean>;
  targetDate?: Nullable<DateTime>;
  handledAt?: Nullable<DateTime>;
}

export interface CreateTaskCategoryInput {
  companyId: number;
  name: string;
  color: string;
}

export interface UpdateTaskCategoryInput {
  id: number;
  name: string;
  color: string;
  companyId: number;
}

export interface LeadInput {
  id: number;
}

export interface CreateThrowInput {
  companyId: number;
  userId: number;
  body: string;
  targets?: Nullable<Nullable<LeadInput>[]>;
}

export interface UpdateThrowInput {
  id: number;
  companyId?: Nullable<number>;
  userId?: Nullable<number>;
  body?: Nullable<string>;
  targets?: Nullable<Nullable<LeadInput>[]>;
}

export interface CreateTicketTicketProductInput {
  productId: number;
  amount: number;
  value: number;
}

export interface QuoteInput {
  id: number;
}

export interface CreateTicketInput {
  userId: number;
  leadId: number;
  companyId: number;
  tagsIds?: Nullable<Nullable<number>[]>;
  value: number;
  origin?: Nullable<string>;
  observation?: Nullable<string>;
  quotes?: Nullable<Nullable<QuoteInput>[]>;
  products?: Nullable<Nullable<CreateTicketTicketProductInput>[]>;
  customFields?: Nullable<CustomScalar>;
}

export interface UpdateTicketInput {
  id: number;
  userId?: Nullable<number>;
  leadId?: Nullable<number>;
  tagsIds?: Nullable<Nullable<number>[]>;
  companyId?: Nullable<number>;
  value?: Nullable<number>;
  origin?: Nullable<string>;
  observation?: Nullable<string>;
  quotes?: Nullable<Nullable<QuoteInput>[]>;
  products?: Nullable<Nullable<CreateTicketTicketProductInput>[]>;
  isActive?: Nullable<boolean>;
  customFields?: Nullable<CustomScalar>;
}

export interface CreateTicketProductInput {
  productId: number;
  ticketId: number;
  amount: number;
  value: number;
}

export interface UpdateTicketProductInput {
  id: number;
  productId?: Nullable<number>;
  ticketId?: Nullable<number>;
  amount?: Nullable<number>;
  value?: Nullable<number>;
}

export interface CreateUserInput {
  companyId: number;
  permissions?: Nullable<CustomScalar>;
  username: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  id: number;
  companyId?: Nullable<number>;
  permissions?: Nullable<CustomScalar>;
  username?: Nullable<string>;
  password?: Nullable<string>;
  name?: Nullable<string>;
  zapQrcode?: Nullable<string>;
  zapStatus?: Nullable<string>;
  isActive?: Nullable<boolean>;
}

export interface ConnectWhatsappInput {
  companyId: number;
  userId: number;
}

export interface DisconnectWhatsappInput {
  companyId: number;
  userId: number;
}

export interface ShutdownWhatsappInput {
  userId: number;
  companyId: number;
}

export interface SendMessageInput {
  userId: number;
  message: string;
  leadIds?: Nullable<Nullable<number>[]>;
  companyId: number;
  file?: Nullable<CustomScalar>;
  phoneNumbers?: Nullable<Nullable<string>[]>;
}

export interface Attribute {
  id: number;
  companyId: number;
  userId: number;
  name: string;
  observation?: Nullable<string>;
  types: Nullable<AtributeType>[];
  valueType: AtributeValueType;
  company: Company;
  user: User;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyAttributeReponse {
  objects: Nullable<Attribute>[];
  total: number;
}

export interface IQuery {
  attributes(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyAttributeReponse | Promise<FindManyAttributeReponse>;

  attribute(id: number): Nullable<Attribute> | Promise<Nullable<Attribute>>;

  categories(
    page: number,
    pageSize: number
  ): FindManyCategoryResponse | Promise<FindManyCategoryResponse>;

  category(id: number): Nullable<Category> | Promise<Nullable<Category>>;

  companies(): Nullable<Company>[] | Promise<Nullable<Company>[]>;

  company(
    id?: Nullable<number>
  ): Nullable<Company> | Promise<Nullable<Company>>;

  leads(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyLeadsResponse | Promise<FindManyLeadsResponse>;

  lead(id: number): Nullable<Lead> | Promise<Nullable<Lead>>;

  products(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyProductsResponse | Promise<FindManyProductsResponse>;

  product(id: number): Nullable<Product> | Promise<Nullable<Product>>;

  quotes(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyQuotesResponse | Promise<FindManyQuotesResponse>;

  quote(id: number): Nullable<Quote> | Promise<Nullable<Quote>>;

  quoteProducts(): Nullable<QuoteProduct>[] | Promise<Nullable<QuoteProduct>[]>;

  quoteProduct(
    id: number
  ): Nullable<QuoteProduct> | Promise<Nullable<QuoteProduct>>;

  roles(): Nullable<Role>[] | Promise<Nullable<Role>[]>;

  role(id: number): Nullable<Role> | Promise<Nullable<Role>>;

  tags(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyTagReponse | Promise<FindManyTagReponse>;

  tag(id: number): Nullable<Tag> | Promise<Nullable<Tag>>;

  tasks(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyTasksResponse | Promise<FindManyTasksResponse>;

  task(id: number): Nullable<Task> | Promise<Nullable<Task>>;

  taskCategories(
    page: number,
    pageSize: number
  ): FindManyTaskCategoryResponse | Promise<FindManyTaskCategoryResponse>;

  taskCategory(
    id: number
  ): Nullable<TaskCategory> | Promise<Nullable<TaskCategory>>;

  throws(): Nullable<Throw>[] | Promise<Nullable<Throw>[]>;

  throw(id: number): Nullable<Throw> | Promise<Nullable<Throw>>;

  tickets(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyTicketsResponse | Promise<FindManyTicketsResponse>;

  ticket(id: number): Nullable<Ticket> | Promise<Nullable<Ticket>>;

  ticketProducts():
    | Nullable<TicketProduct>[]
    | Promise<Nullable<TicketProduct>[]>;

  ticketProduct(
    id: number
  ): Nullable<TicketProduct> | Promise<Nullable<TicketProduct>>;

  users(
    page: number,
    pageSize: number,
    filters?: Nullable<FiltersInput>
  ): FindManyUserResponse | Promise<FindManyUserResponse>;

  user(id: number): Nullable<User> | Promise<Nullable<User>>;
}

export interface IMutation {
  createAttribute(
    createAttributeInput: CreateAttributeInput
  ): Attribute | Promise<Attribute>;

  updateAttribute(
    updateAttributeInput: UpdateAttributeInput
  ): Attribute | Promise<Attribute>;

  removeAttribute(
    id: number
  ): Nullable<Attribute> | Promise<Nullable<Attribute>>;

  signIn(signInInput: SignInInput): AuthResponse | Promise<AuthResponse>;

  createCategory(
    createCategoryInput: CreateCategoryInput
  ): Category | Promise<Category>;

  updateCategory(
    updateCategoryInput: UpdateCategoryInput
  ): Category | Promise<Category>;

  removeCategory(id: number): Nullable<Category> | Promise<Nullable<Category>>;

  createCompany(
    createCompanyInput: CreateCompanyInput
  ): Company | Promise<Company>;

  updateCompany(
    updateCompanyInput: UpdateCompanyInput
  ): Nullable<Company> | Promise<Nullable<Company>>;

  removeCompany(id: number): Nullable<Company> | Promise<Nullable<Company>>;

  createLead(
    createLeadInput: CreateLeadInput
  ): CreateLeadResponse | Promise<CreateLeadResponse>;

  createLeads(
    createLeadsInput: CreateLeadsInput
  ): CreateLeadsResponse | Promise<CreateLeadsResponse>;

  updateLead(updateLeadInput: UpdateLeadInput): Lead | Promise<Lead>;

  removeLead(id: number): Nullable<Lead> | Promise<Nullable<Lead>>;

  createProduct(
    createProductInput: CreateProductInput
  ): Product | Promise<Product>;

  updateProduct(
    updateProductInput: UpdateProductInput
  ): Product | Promise<Product>;

  removeProduct(id: number): Nullable<Product> | Promise<Nullable<Product>>;

  createQuote(createQuoteInput: CreateQuoteInput): Quote | Promise<Quote>;

  updateQuote(updateQuoteInput: UpdateQuoteInput): Quote | Promise<Quote>;

  removeQuote(id: number): Nullable<Quote> | Promise<Nullable<Quote>>;

  createQuoteProduct(
    createQuoteProductInput: CreateQuoteProductInput
  ): QuoteProduct | Promise<QuoteProduct>;

  updateQuoteProduct(
    updateQuoteProductInput: UpdateQuoteProductInput
  ): QuoteProduct | Promise<QuoteProduct>;

  removeQuoteProduct(
    id: number
  ): Nullable<QuoteProduct> | Promise<Nullable<QuoteProduct>>;

  createRole(createRoleInput: CreateRoleInput): Role | Promise<Role>;

  updateRole(updateRoleInput: UpdateRoleInput): Role | Promise<Role>;

  removeRole(id: number): Nullable<Role> | Promise<Nullable<Role>>;

  createTag(createTagInput: CreateTagInput): Tag | Promise<Tag>;

  updateTag(updateTagInput: UpdateTagInput): Tag | Promise<Tag>;

  removeTag(id: number): Nullable<Tag> | Promise<Nullable<Tag>>;

  createTask(createTaskInput: CreateTaskInput): Task | Promise<Task>;

  updateTask(updateTaskInput: UpdateTaskInput): Task | Promise<Task>;

  removeTask(id: number): Nullable<Task> | Promise<Nullable<Task>>;

  createTaskCategory(
    createTaskCategoryInput: CreateTaskCategoryInput
  ): TaskCategory | Promise<TaskCategory>;

  updateTaskCategory(
    updateTaskCategoryInput: UpdateTaskCategoryInput
  ): TaskCategory | Promise<TaskCategory>;

  removeTaskCategory(
    id: number
  ): Nullable<TaskCategory> | Promise<Nullable<TaskCategory>>;

  createThrow(createThrowInput: CreateThrowInput): Throw | Promise<Throw>;

  updateThrow(updateThrowInput: UpdateThrowInput): Throw | Promise<Throw>;

  removeThrow(id: number): Nullable<Throw> | Promise<Nullable<Throw>>;

  createTicket(createTicketInput: CreateTicketInput): Ticket | Promise<Ticket>;

  updateTicket(updateTicketInput: UpdateTicketInput): Ticket | Promise<Ticket>;

  removeTicket(id: number): Nullable<Ticket> | Promise<Nullable<Ticket>>;

  createTicketProduct(
    createTicketProductInput: CreateTicketProductInput
  ): TicketProduct | Promise<TicketProduct>;

  updateTicketProduct(
    updateTicketProductInput: UpdateTicketProductInput
  ): TicketProduct | Promise<TicketProduct>;

  removeTicketProduct(
    id: number
  ): Nullable<TicketProduct> | Promise<Nullable<TicketProduct>>;

  createUser(createUserInput: CreateUserInput): User | Promise<User>;

  updateUser(updateUserInput: UpdateUserInput): User | Promise<User>;

  removeUser(id: number): Nullable<User> | Promise<Nullable<User>>;

  connectWhatsapp(
    connectWhatsappInput: ConnectWhatsappInput
  ): WhatsappConnectionResponse | Promise<WhatsappConnectionResponse>;

  disconnectWhatsapp(
    disconnectWhatsappInput: DisconnectWhatsappInput
  ): WhatsappConnectionResponse | Promise<WhatsappConnectionResponse>;

  shutdownWhatsapp(
    shutdownWhatsappInput: ShutdownWhatsappInput
  ): ShutdownResponse | Promise<ShutdownResponse>;

  sendMessage(
    sendMessageInput: SendMessageInput
  ): SendMessageResponse | Promise<SendMessageResponse>;
}

export interface AuthResponse {
  access_token?: Nullable<string>;
  id?: Nullable<number>;
  name?: Nullable<string>;
  username?: Nullable<string>;
  isAuthenticated: boolean;
  permissions: JSON;
}

export interface Category {
  id: number;
  companyId: number;
  name: string;
  products?: Nullable<Nullable<Product>[]>;
  company: Company;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyCategoryResponse {
  objects: Nullable<Category>[];
  total: number;
}

export interface Company {
  id: number;
  name: string;
  email?: Nullable<string>;
  phone?: Nullable<string>;
  plan: string;
  maxWhatsappSlots: number;
  whatsappSlots: number;
  leads?: Nullable<Nullable<Lead>[]>;
  users?: Nullable<Nullable<User>[]>;
  tickets?: Nullable<Nullable<Ticket>[]>;
  products?: Nullable<Nullable<Product>[]>;
  tasks?: Nullable<Nullable<Task>[]>;
  quotes?: Nullable<Nullable<Quote>[]>;
  roles?: Nullable<Nullable<Role>[]>;
  categories?: Nullable<Nullable<Category>[]>;
  attributes?: Nullable<Nullable<Attribute>[]>;
  customFields?: Nullable<CustomScalar>;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface Lead {
  id: number;
  uuid?: Nullable<string>;
  companyId: number;
  userId: number;
  name: string;
  CPF?: Nullable<string>;
  phone?: Nullable<string>;
  mail?: Nullable<string>;
  adOrigin?: Nullable<string>;
  status?: Nullable<string>;
  observation?: Nullable<string>;
  customFields?: Nullable<CustomScalar>;
  age?: Nullable<number>;
  neighborhood?: Nullable<string>;
  adress?: Nullable<string>;
  zipCode?: Nullable<string>;
  houseNumber?: Nullable<number>;
  profession?: Nullable<string>;
  birthday?: Nullable<DateTime>;
  birthdayDay?: Nullable<number>;
  birthdayMonth?: Nullable<number>;
  birthdayYear?: Nullable<number>;
  throws?: Nullable<Nullable<Throw>[]>;
  tasks?: Nullable<Nullable<Task>[]>;
  tickets?: Nullable<Nullable<Ticket>[]>;
  tags?: Nullable<Nullable<Tag>[]>;
  quotes?: Nullable<Nullable<Quote>[]>;
  user: User;
  company: Company;
  isRescue: boolean;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyLeadsResponse {
  objects: Nullable<Lead>[];
  total: number;
}

export interface ErrorResponse {
  message: string;
  status: string;
}

export interface CreateLeadResponse {
  lead?: Nullable<Lead>;
  error?: Nullable<ErrorResponse>;
}

export interface CreateLeadsResponse {
  count: number;
}

export interface Product {
  id: number;
  sku: string;
  companyId: number;
  categoryId: number;
  name: string;
  value?: Nullable<number>;
  ticketProducts?: Nullable<Nullable<TicketProduct>[]>;
  quoteProducts?: Nullable<Nullable<QuoteProduct>[]>;
  tags?: Nullable<Nullable<Tag>[]>;
  customFields?: Nullable<CustomScalar>;
  company: Company;
  category: Category;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyProductsResponse {
  objects: Nullable<Product>[];
  total: number;
}

export interface Quote {
  id: number;
  companyId: number;
  userId: number;
  leadId: number;
  ticketId?: Nullable<number>;
  observation?: Nullable<string>;
  value: number;
  products?: Nullable<Nullable<QuoteProduct>[]>;
  customFields?: Nullable<CustomScalar>;
  ticket?: Nullable<Ticket>;
  tasks?: Nullable<Nullable<Task>[]>;
  tags?: Nullable<Nullable<Tag>[]>;
  company: Company;
  user: User;
  lead?: Nullable<Lead>;
  handledAt?: Nullable<DateTime>;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyQuotesResponse {
  objects: Nullable<Quote>[];
  total: number;
}

export interface QuoteProduct {
  id: number;
  productId: number;
  quoteId: number;
  amount: number;
  value: number;
  product: Product;
  quote: Quote;
}

export interface Role {
  id: number;
  companyId: number;
  name: string;
  permissions: JSON;
  company: Company;
  users?: Nullable<Nullable<User>[]>;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface Tag {
  id: number;
  companyId: number;
  name: string;
  colorHex: string;
  description?: Nullable<string>;
  quotes?: Nullable<Nullable<Quote>[]>;
  leads?: Nullable<Nullable<Lead>[]>;
  tickets?: Nullable<Nullable<Ticket>[]>;
  products?: Nullable<Nullable<Product>[]>;
  tasks?: Nullable<Nullable<Task>[]>;
  company: Company;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyTagReponse {
  objects: Nullable<Tag>[];
  total: number;
}

export interface Task {
  id: number;
  companyId: number;
  userId: number;
  title: string;
  body: string;
  observation?: Nullable<string>;
  conclusion: string;
  categoryid: number;
  category: TaskCategory;
  targets?: Nullable<Nullable<Lead>[]>;
  quotes?: Nullable<Nullable<Quote>[]>;
  tasks?: Nullable<Nullable<Task>[]>;
  user: User;
  company: Company;
  isHandled: boolean;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
  targetDate: DateTime;
  handledAt?: Nullable<DateTime>;
}

export interface FindManyTasksResponse {
  objects: Nullable<Task>[];
  total: number;
}

export interface TaskCategory {
  id: number;
  companyId: number;
  name: string;
  color: string;
  tasks?: Nullable<Nullable<Task>[]>;
  company: Company;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyTaskCategoryResponse {
  objects: Nullable<TaskCategory>[];
  total: number;
}

export interface Throw {
  id: number;
  companyId: number;
  userId: number;
  body: string;
  targets?: Nullable<Nullable<Lead>[]>;
  user: User;
  createdAt: DateTime;
}

export interface Ticket {
  id: number;
  userId: number;
  leadId: number;
  companyId: number;
  value: number;
  origin?: Nullable<string>;
  observation?: Nullable<string>;
  customFields?: Nullable<CustomScalar>;
  quotes?: Nullable<Nullable<Quote>[]>;
  tags?: Nullable<Nullable<Tag>[]>;
  lead: Lead;
  products?: Nullable<Nullable<TicketProduct>[]>;
  user: User;
  company: Company;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyTicketsResponse {
  objects: Nullable<Ticket>[];
  total: number;
}

export interface TicketProduct {
  id: number;
  productId: number;
  ticketId: number;
  amount: number;
  value: number;
  product: Product;
  ticket: Ticket;
}

export interface User {
  id: number;
  companyId: number;
  permissions: CustomScalar;
  username: string;
  password: string;
  name: string;
  zapQrcode: string;
  zapStatus: string;
  company: Company;
  tickets?: Nullable<Nullable<Ticket>[]>;
  throws?: Nullable<Nullable<Throw>[]>;
  tasks?: Nullable<Nullable<Task>[]>;
  quotes?: Nullable<Nullable<Quote>[]>;
  leads?: Nullable<Nullable<Lead>[]>;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface FindManyUserResponse {
  objects: Nullable<User>[];
  total: number;
}

export interface WhatsappConnectionResponse {
  isConnected: boolean;
  qrCode?: Nullable<string>;
  message?: Nullable<string>;
}

export interface SendMessageResponse {
  succeeded?: Nullable<boolean>;
}

export interface ShutdownResponse {
  succeeded?: Nullable<boolean>;
}

export type DateTime = any;
export type JSON = any;
export type CustomScalar = any;
type Nullable<T> = T | null;
