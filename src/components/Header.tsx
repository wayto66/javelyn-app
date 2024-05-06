import { useSession, signOut } from "next-auth/react";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { reactContext } from "~/pages/_app";

const Header = () => {
  const { data: session } = useSession();
  const ctx = useContext(reactContext);
  const [headerSubMenuShow, setHeaderSubMenuShow] = useState(false);

  const handleSignOut = async () => {
    signOut({ redirect: true, callbackUrl: "/" });
  };
  return (
    <div className="abcd fixed z-[10] flex w-full flex-row justify-between gap-6 bg-gradient-to-r from-[MediumSlateBlue] to-[MediumPurple] py-1 px-6">
      <h1 className="bg-gradient-to-r from-white to-violet-200 bg-clip-text text-xl font-extrabold uppercase tracking-widest text-transparent drop-shadow-xl">
        Javelyn
      </h1>
      <div className="flex flex-row items-center gap-4">
        {" "}
        <div className="font-bold uppercase text-white">
          {session?.user.name}
        </div>
        <div className="relative">
          <button
            className="rounded-md bg-white/50 px-2 py-[1px] font-bold uppercase text-gray-800 transition hover:scale-[1.01] hover:bg-white/70 active:scale-[0.96]"
            onClick={() => setHeaderSubMenuShow((prev) => !prev)}
          >
            Menu
          </button>
          <div
            className={`${
              headerSubMenuShow ? "flex" : "hidden"
            } absolute top-[100%] right-0 z-[11] flex-col gap-4 bg-gradient-to-b from-[mediumslateblue] to-violet-500 p-4 font-bold uppercase text-white `}
          >
            <div
              className="cursor-pointer transition hover:text-cyan-300"
              onClick={() => {
                toast.info("Método a ser implementado");
              }}
            >
              Ajuda
            </div>
            <button
              className="rounded-md bg-black/30 px-2 py-[1px]  transition hover:scale-[1.04] active:scale-[0.96]"
              onClick={() => handleSignOut()}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
