"use-client";

import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { Suspense, useContext, useEffect, useMemo } from "react";
import { reactContext } from "./_app";
import LoadingOverlap from "../components/LoadingOverlap";
import HomePanel from "~/components/panels/HomePanel";
import LeadPanel from "~/components/panels/lead/LeadPanel";
import ProductPanel from "~/components/panels/product/ProductPanel";
import QuotePanel from "~/components/panels/quote/QuotePanel";
import SettingsPanel from "~/components/panels/SettingsPanel";
import { Sidebar } from "~/components/bar/Sidebar";
import CreateProductPanel from "~/components/panels/product/CreateProductPanel";
import CreateProductCategoryPanel from "~/components/panels/product/CreateProductCategoryPanel";
import CategoryPanel from "~/components/panels/product/CategoryPanel";
import EditProductCategoryPanel from "~/components/panels/product/EditProductCategoryPanel";
import UserPanel from "~/components/panels/user/UserPanel";
import CreateTagPanel from "~/components/panels/tag/CreateTagPanel";
import TagPanel from "~/components/panels/tag/TagPanel";
import EditTagPanel from "~/components/panels/tag/EditTagPanel";
import EditProductPanel from "~/components/panels/product/EditProductPanel";
import { useRouter } from "next/router";
import { fetchData } from "~/handlers/fetchData";
import TicketPanel from "~/components/panels/ticket/TicketPanel";
import ContactPanel from "~/components/panels/ContactPanel";
import CreateTicketPanel from "~/components/panels/ticket/CreateTicketPanel";
import EditTicketPanel from "~/components/panels/ticket/EditTicketPanel";
import CreateQuotePanel from "~/components/panels/quote/CreateQuotePanel";
import EditQuotePanel from "~/components/panels/quote/EditQuotePanel";
import CreateLeadPanel from "~/components/panels/lead/CreateLeadPanel";
import EditLeadPanel from "~/components/panels/lead/EditLeadPanel";
import CreateTaskPanel from "~/components/panels/task/CreateTaskPanel";
import TaskPanel from "~/components/panels/task/TaskPanel";
import EditTaskPanel from "~/components/panels/task/EditTaskPanel";
import TaskCategoryPanel from "~/components/panels/task/TaskCategoryPanel";
import CreateTaskCategoryPanel from "~/components/panels/task/CreateTaskCategoryPanel";
import EditTaskCategoryPanel from "~/components/panels/task/EditTaskCategoryPanel";
import CreateUserPanel from "~/components/panels/user/CreateUserPanel";
import AttributePanel from "~/components/panels/attribute/AttributePanel";
import CreateAttributePanel from "~/components/panels/attribute/CreateAttributePanel";
import EditAttributePanel from "~/components/panels/attribute/EditAttributePanel";
import EditUserPanel from "~/components/panels/user/EditUserPanel";
import { DashboardPanel } from "~/components/panels/dashboard/DashboardPanel";

const panelMap = new Map<string, JSX.Element>([
  ["home", <HomePanel />],
  ["contact", <ContactPanel />],
  ["tickets", <TicketPanel />],
  ["tickets-create", <CreateTicketPanel />],
  ["tickets-edit", <EditTicketPanel />],
  ["products", <ProductPanel />],
  ["products-create", <CreateProductPanel />],
  ["products-edit", <EditProductPanel />],
  ["products-category-create", <CreateProductCategoryPanel />],
  ["products-category-edit", <EditProductCategoryPanel />],
  ["products-categories", <CategoryPanel />],
  ["tags-create", <CreateTagPanel />],
  ["tags", <TagPanel />],
  ["tags-edit", <EditTagPanel />],
  ["tasks-create", <CreateTaskPanel />],
  ["tasks", <TaskPanel />],
  ["tasks-edit", <EditTaskPanel />],
  ["tasks-category-create", <CreateTaskCategoryPanel />],
  ["tasks-category-edit", <EditTaskCategoryPanel />],
  ["tasks-categories", <TaskCategoryPanel />],
  ["leads", <LeadPanel />],
  ["leads-create", <CreateLeadPanel />],
  ["leads-edit", <EditLeadPanel />],
  ["quotes", <QuotePanel />],
  ["quotes-create", <CreateQuotePanel />],
  ["quotes-edit", <EditQuotePanel />],
  ["users", <UserPanel />],
  ["users-create", <CreateUserPanel />],
  ["users-edit", <EditUserPanel />],
  ["attributes", <AttributePanel />],
  ["attributes-create", <CreateAttributePanel />],
  ["attributes-edit", <EditAttributePanel />],
  ["settings", <SettingsPanel />],
  ["dashboard", <DashboardPanel />],
]);

const Home: NextPage = () => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const { data, setData } = ctx;

  const getCompanyData = async () => {
    const response = await fetchData({
      query: `
      query company {
        company(id: ${session?.user.companyId}) {
          id
          name
          attributes {
            id
            name
            valueType
            types
            isActive
          }
        }
      }
      `,
      token: session?.user.accessToken ?? "",
      ctx,
    });
    if (!response) return;
    setData((prev) => {
      return {
        ...prev,
        companyData: response.data.company,
        attributes: response.data.company.attributes,
      };
    });
  };

  useEffect(() => {
    if (!session) return;
    document.body.onkeyup = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setData((prev) => {
          return {
            ...prev,
            showQuoteEditBox: false,
            showLeadEditBox: false,
            showTaskConcludeBox: false,
            showTaskEditBox: false,
          };
        });
      }
    };
    void getCompanyData();
  }, [session]);

  const router = useRouter();
  const query = useMemo(() => {
    return router.query;
  }, [router.query]);

  return (
    <>
      {data?.isLoading ? <LoadingOverlap /> : null}
      <Head>
        <title>Javelyn</title>
        <meta name="description" content="Javelyn System" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css"
        />
      </Head>

      <main className="flex h-full min-h-screen w-full flex-col items-center justify-between bg-gradient-to-r from-slate-100 to-[white] ">
        <div className="fixed bottom-[20px] right-[10px] z-[10]">
          <div
            className="z-[15] cursor-pointer rounded-full  text-xl font-extrabold text-white opacity-[0.5] transition hover:opacity-[1] active:scale-[0.96]"
            onClick={() => {
              console.log({ ctx });
              const scrollY = window.scrollY || window.pageYOffset;

              if (scrollY < 50) {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth", // Adiciona o comportamento de rolagem suave
                });
              } else {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth", // Adiciona o comportamento de rolagem suave
                });
              }
            }}
          >
            {" "}
            <Image
              src="./images/svg/arrowUp.svg"
              height={51}
              width={51}
              alt="arrow-up"
            />
          </div>
        </div>
        {data?.isLoading ? <LoadingOverlap /> : null}
        <div className="flex w-full flex-col">
          <div className=" flex w-full flex-row items-start gap-5 rounded-md bg-gray-50 md:min-w-[600px] lg:min-w-[800px]">
            <div className="flex w-full max-w-[100vw] flex-col rounded-md   md:flex-row">
              <Sidebar />

              <Suspense>
                <div className=" flex w-full  flex-col items-center justify-start overflow-x-hidden px-6 pt-6">
                  {panelMap.get(
                    query.panel?.toString() ?? data?.currentPanel ?? ""
                  ) ?? (
                    <div className="flex h-full w-full items-center justify-center ">
                      <div className="flex flex-col text-center text-jpurple">
                        <span className="text-3xl font-extrabold ">
                          Bem vindo,
                        </span>
                        <span className="font-semibold ">
                          Selecione ao lado um painel para visualizar
                        </span>
                      </div>{" "}
                    </div>
                  )}
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
