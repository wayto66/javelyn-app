import { NextRouter } from "next/router";
import { TContextValue } from "~/pages/_app";

export const handlePanelChange = async (
  panel: string,
  ctx: TContextValue,
  router: NextRouter,
  query?: Record<string, any>
) => {
  ctx?.setData((prev) => {
    return {
      ...prev,
      currentPanel: panel,
    };
  });

  await router.push({
    pathname: router.pathname,
    query: {
      ...router.query,
      ...query,
      panel,
    },
  });

  console.log(router.query);
};
