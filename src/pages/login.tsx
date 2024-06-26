import { type NextPage } from "next";
import {
  SessionProvider,
  SignInOptions,
  signIn,
  useSession,
} from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type TLoginFormParams = {
  username: string;
  password: string;
  rememberMe: boolean;
};

const LoginPage: NextPage = () => {
  const router = useRouter();

  const { register, getValues, watch } = useForm<TLoginFormParams>({
    defaultValues: {
      username:
        typeof window !== "undefined" &&
        localStorage?.getItem("rememberMe") === "true"
          ? localStorage?.getItem("username") ?? ""
          : "",
      password:
        typeof window !== "undefined" &&
        localStorage?.getItem("rememberMe") === "true"
          ? localStorage?.getItem("password") ?? ""
          : "",
      rememberMe:
        typeof window !== "undefined"
          ? localStorage?.getItem("rememberMe") === "true"
          : false,
    },
  });

  useEffect(() => {
    if (getValues("rememberMe") === true)
      localStorage.setItem("rememberMe", "true");
    else localStorage.setItem("rememberMe", "false");
  }, [watch("rememberMe")]);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const { username, password, rememberMe } = getValues();

    const res = await signIn("credentials", {
      username: username,
      password: password,
      redirect: false,
      callbackUrl: "/",
    });

    if (res?.ok) {
      if (rememberMe) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        localStorage.setItem("rememberMe", "true");
      }
      window.location.replace("/dashboard");
    } else {
      toast.error("Dados incorretos, tente novamente.");
    }

    console.log({ res });
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
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => handleLogin(e)}
              >
                <input
                  type="text"
                  className="rounded-md border px-2"
                  placeholder="Usuário"
                  {...register("username")}
                  required
                />
                <input
                  type="password"
                  className="rounded-md border px-2"
                  placeholder="Senha"
                  {...register("password")}
                  required
                />
                <div className="flex w-full flex-row items-center justify-center gap-2  ">
                  <input type="checkbox" {...register("rememberMe")} />
                  <div className="text-xs text-slate-500">Lembrar-me</div>
                </div>
                <button className="rounded-md bg-gradient-to-r from-[MediumPurple] from-[MediumPurple] to-[MediumSlateBlue] to-[MediumSlateBlue] px-2 py-1 text-center font-extrabold uppercase text-white transition transition hover:scale-[1.04] hover:bg-gradient-to-r">
                  entrar
                </button>
              </form>
            </div>
          </div>
        </main>
      </SessionProvider>{" "}
    </>
  );
};

export default LoginPage;
