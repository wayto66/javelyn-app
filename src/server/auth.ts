import { verify } from "jsonwebtoken";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type User,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { fetchData } from "~/handlers/fetchData";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      accessToken: string;
      email: string;
      aud: string;
      companyId: number;
      permissions: Record<string, boolean>;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session({ session, token }) {
      if (!session) {
        console.error("No session.");
      }

      return {
        ...session,
        user: token.user as {
          id: number;
          accessToken: string;
          email: string;
          aud: string;
        } & DefaultSession["user"],
      };
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "username",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;
        const { username, password } = credentials;

        const loginResponse = await fetchData({
          mutation: `
          mutation {
          signIn(signInInput: {
          username: "${username}"
          password: "${password}"
          }) {
          name
          id
          access_token
          isAuthenticated
          username
          }
          }
          `,
          token: "",
        });

        if (
          !loginResponse?.data?.signIn?.isAuthenticated ||
          !loginResponse?.data?.signIn.id
        ) {
          return null;
        }

        const token = loginResponse.data.signIn.access_token;

        const decoded = verify(token, process.env.JWT_SECRET ?? "") as User;

        console.log({ ...decoded, accessToken: token });

        return { ...decoded, accessToken: token } ?? null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/",
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
