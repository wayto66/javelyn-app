import { toast } from "react-toastify";
import fetchDbData from "./fetchDbData";

type TParams = {
  treshold: number;
  setLoadingOverlapVisibility: any;
  companyId: number;
};

const handleClientActiveStatus = async (data: TParams) => {
  if (
    data.treshold < 1 ||
    typeof data.treshold !== "number" ||
    !data.treshold
  ) {
    toast.error("Limite de dias inválido");
    return;
  }

  data.setLoadingOverlapVisibility(true);

  await fetchDbData({
    method: "PATCH",
    path: "client/handle-active-status",
    data: {
      companyId: data.companyId,
      treshold: data.treshold,
    },
  });

  data.setLoadingOverlapVisibility(false);
};

export default handleClientActiveStatus;
