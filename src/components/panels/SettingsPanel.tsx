import {
  IconKey,
  IconLock,
  IconLockBolt,
  IconPassword,
  IconPasswordUser,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { use, useContext } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import fetchDbData from "~/helpers/fetchDbData";
import { reactContext } from "~/pages/_app";
import { ShineButton } from "../micros/ShineButton";

const SettingsPanel = () => {
  const { register, getValues, handleSubmit } = useForm();
  const ctx = useContext(reactContext);
  const { data: session } = useSession();

  const handleFormSubmit = async () => {
    const newPass = getValues("newPass");
    const passConfirmation = getValues("passConfirmation");
    if (newPass !== passConfirmation) {
      toast.error(
        "A senha e a confirmação não coincidem. Por favor digite novamente."
      );
      return;
    }

    console.log({ newPass });
    const fetch = await fetchDbData({
      path: "user",
      method: "PATCH",
      data: {
        id: session?.user.id,
        password: newPass,
      },
    });

    if (fetch) {
      toast.success("Senha alterada com sucesso.");
    } else {
      toast.error("Houve um erro inesperado.");
    }
  };
  return (
    <div className="h-full min-h-screen w-full ">
      <div className="grid h-full w-full grid-cols-2 gap-12 rounded-md backdrop-blur">
        <div className="flex flex-col">
          <div className="flex h-max w-full flex-row items-center justify-center gap-4 rounded-md bg-secondary p-2 text-white transition hover:scale-[1.03]">
            <IconKey size={40} />
            <span className="font-semibold">Alterar Senha</span>
          </div>
          <div className="bg-white p-4">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <input
                type="password"
                className="w-full rounded-md border px-4 py-1"
                placeholder="Nova senha"
                {...register("newPass", {
                  required: true,
                  minLength: 8,
                  maxLength: 20,
                })}
              />
              <input
                type="password"
                className="w-full rounded-md border px-4 py-1"
                placeholder="Repita a nova senha"
                {...register("passConfirmation", {
                  required: true,
                  minLength: 8,
                  maxLength: 20,
                })}
              />

              <ShineButton className="ml-auto mt-6"> Confirmar </ShineButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
