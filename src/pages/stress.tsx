import { type NextPage } from "next";
import {
  SessionProvider,
  SignInOptions,
  signIn,
  useSession,
} from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { fetchData } from "~/handlers/fetchData";
import { reactContext } from "./_app";

type TLoginFormParams = {
  username: string;
  password: string;
  rememberMe: boolean;
};

const LoginPage: NextPage = () => {
  const ctx = useContext(reactContext);

  const updateUser = async () => {
    const response = await fetchData({
      mutation: `
        mutation {
        updateUser(updateUserInput: {
        id: 4
        name: "test-${Math.random()}"
        }) {
        name
        id
        companyId
        }
        }
      `,
      token: "",
      ctx,
    });
  };

  const stress = async () => {
    for (let i = 0; i < 5000; i++) {
      updateUser();
    }
  };

  return (
    <>
      <SessionProvider>
        <Head>
          <title>Javelyn - Login</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="stylesheet" href="https://use.typekit.net/ivi8uyr.css" />
        </Head>
        <main className="no-repeat relative flex min-h-screen flex-col items-center justify-center bg-[lavender]">
          <div className="absolute inset-0 flex min-h-screen flex-col items-center justify-center gap-16 backdrop-blur-[20px] ">
            {" "}
            <div className="mb-6">
              <h1 className="bg-gradient-to-r from-violet-400 to-[MediumSlateBlue] bg-clip-text text-6xl font-extrabold text-transparent drop-shadow-xl">
                Javelyn
              </h1>
            </div>
            <div className="rounded-md bg-white p-6 shadow-2xl">
              <button onClick={stress}>stress</button>
            </div>
          </div>
        </main>
      </SessionProvider>{" "}
    </>
  );
};

export default LoginPage;
