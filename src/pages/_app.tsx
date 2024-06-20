import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import "react-calendar/dist/Calendar.css";
import "react-date-picker/dist/DatePicker.css";
import "react-toastify/dist/ReactToastify.css";

const contextDefaultValue: TContextData = {
  companyData: undefined,
  listReloadFunction: () => {},

  currentPanel: "",
  contactClientList: [],
  user: undefined,
  currentClientData: undefined,
  currentLeadData: undefined,
  currentLeads: undefined,
  currentProductData: undefined,
  currentTaskData: undefined,
  attributes: undefined,
  currentTagData: undefined,
  currentTicketData: undefined,
  currentQuoteData: undefined,
  currentCategoryData: undefined,
  currentTaskCategory: undefined,
  taskTargetDate: new Date(),
  isLoading: false,
  leadFieldsToShow: {
    name: true,
    CPF: true,
    phone: true,
    tags: true,
    mail: true,
    customFields: {},
    date: true,
  },
  quoteFieldsToShow: {
    name: true,
    tags: true,
    customFields: {},
    date: true,
  },
  ticketFieldsToShow: {
    name: true,
    tags: true,
    customFields: {},
    date: true,
  },

  showClientEditBox: false,
  showEvaluationEditBox: false,
  showGroupEditBox: false,
  showGroupCreationBox: false,
  showLeadEditBox: false,
  showListEditBox: false,
  showListCreationBox: false,
  showProductEditBox: false,
  showTaskEditBox: false,
  showTaskConcludeBox: false,
  showQuoteEditBox: false,

  confirmationModalData: {
    message: "",
    action: () => {
      ("");
    },
    color: "",
    visible: false,
  },
};

export type TContextValue = {
  data: TContextData;
  setData: Dispatch<SetStateAction<TContextData>>;
};

export const reactContext = React.createContext<TContextValue>({
  data: contextDefaultValue,
  setData: () => {},
});

import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import startTooltips from "~/helpers/startTooltips";
import "~/styles/globals.css";
import { TContextData } from "~/types/Context";
import ConfirmationModal from "~/components/modals/ConfirmationModal";
import { Head } from "next/document";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [data, setData] = useState<TContextData>(contextDefaultValue);

  useEffect(() => {
    startTooltips();
  }, []);

  return (
    <>
      <reactContext.Provider
        value={{
          data,
          setData,
        }}
      >
        <SessionProvider session={session}>
          <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          {data.confirmationModalData.visible && <ConfirmationModal />}
          <Component {...pageProps} />
        </SessionProvider>
      </reactContext.Provider>
    </>
  );
};

export default MyApp;
