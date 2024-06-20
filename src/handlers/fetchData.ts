import { ApolloQueryResult, FetchResult, gql } from "@apollo/client";
import { apolloClient } from "~/constants/ApolloClient";
import { TContextValue } from "~/pages/_app";

type TFetchDataParams = {
  token?: string;
  query?: string;
  mutation?: string;
  ctx?: TContextValue;
  variables?: any;
  useCache?: boolean;
};

export const fetchData = async ({
  token,
  query,
  mutation,
  ctx,
  variables,
  useCache,
}: TFetchDataParams) => {
  try {
    let result: ApolloQueryResult<any> | FetchResult<any> | undefined;

    ctx?.setData((prev) => {
      return {
        ...prev,
        isLoading: true,
      };
    });

    if (typeof window !== "undefined")
      window.document.body.style.cursor = "wait";

    if (query) {
      result = await apolloClient.query({
        query: gql(query),
        variables,
        fetchPolicy: useCache ? "cache-first" : "network-only",
        context: {
          graphqlContext: {
            query,
            variables,
          },
        },
      });
    } else if (mutation) {
      result = await apolloClient.mutate({
        mutation: gql(mutation),
        variables,
        context: {
          graphqlContext: {
            mutation,
            variables,
          },
        },
      });
    }
    ctx?.setData((prev) => {
      return {
        ...prev,
        isLoading: false,
      };
    });

    if (typeof window !== "undefined")
      window.document.body.style.cursor = "auto";

    if (!result) return null;
    return result;
  } catch (error: any) {
    console.error(JSON.parse(JSON.stringify(error)));
    ctx?.setData((prev) => {
      return {
        ...prev,
        isLoading: false,
      };
    });
    if (typeof window !== "undefined")
      window.document.body.style.cursor = "auto";
  }
};
