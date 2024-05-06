import fetchDbData from "./fetchDbData";

type TParams = {
  companyId: number;
  showLoading: any;
};

const handleClientType = async (data: TParams) => {
  if (!data.companyId) return;

  data.showLoading(true);

  await fetchDbData({
    method: "PATCH",
    path: "client/update-client-type",
    data: {
      companyId: data.companyId,
    },
  });

  data.showLoading(false);
};

export default handleClientType;
