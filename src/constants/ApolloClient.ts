import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import axios from "axios";

// Link para adicionar a assinatura HMAC nos cabeçalhos
const authLink = setContext(async (req, { headers, ...rest }) => {
  // Obter a assinatura HMAC do servidor
  const { graphqlContext } = rest;
  const baseURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://javelyn.com.br";
  // Garanta que graphqlContext existe
  const body = graphqlContext;
  const hmacResponse = await axios.post(`${baseURL}/api/hmac/`, body);
  const hmacSignature = hmacResponse.data.signature;

  return {
    headers: {
      ...headers,
      "x-hmac-signature": hmacSignature,
    },
  };
});

// Link HTTP para se comunicar com o servidor GraphQL
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_SERVER_URL,
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
