import ConvertIcon from "public/images/svg/ConvertIcon";
import { useContext } from "react";
import { reactContext } from "~/pages/_app";

type TParams = {
  setConclusion: (v: string) => void;
  conclusion: string;
  category: string;
  targetType: string | undefined;
};

const GenericTaskConclusionsBox = ({
  setConclusion,
  conclusion,
  category,
  targetType,
}: TParams) => {
  const ctx = useContext(reactContext);

  return (
    <div className="grid grid-cols-3 gap-2 rounded-md border p-2">
      <div
        className={`${
          conclusion === `${category}-to-evaluation`
            ? "bg-[mediumslateblue]"
            : "bg-gray-400 "
        } flex cursor-pointer flex-col items-center justify-start rounded-md p-2 text-center text-sm font-extrabold uppercase text-white transition hover:scale-[1.03] hover:bg-[mediumpurple] active:scale-[0.97]`}
        onClick={() => setConclusion(`${category}-to-evaluation`)}
      >
        <ConvertIcon className="h-8 stroke-white" />
        <div className="mt-2 flex grow flex-col items-center justify-center text-xs">
          Avaliação
        </div>
      </div>
      <div
        className={`${
          conclusion === `${category}-to-quote`
            ? "bg-[mediumslateblue]"
            : "bg-gray-400 "
        } flex cursor-pointer flex-col items-center justify-start rounded-md p-2 text-center text-sm font-extrabold uppercase text-white transition hover:scale-[1.03] hover:bg-[mediumpurple] active:scale-[0.97]`}
        onClick={() => setConclusion(`${category}-to-quote`)}
      >
        <ConvertIcon className="h-8 stroke-white" />
        <div className="mt-2 flex grow flex-col items-center justify-center text-xs">
          Orçamento
        </div>
      </div>
      <div
        className={`${
          conclusion === `${category}-to-ticket`
            ? "bg-[mediumslateblue]"
            : "bg-gray-400 "
        } flex cursor-pointer flex-col items-center justify-start rounded-md p-2 text-center text-sm font-extrabold uppercase text-white transition hover:scale-[1.03] hover:bg-[mediumpurple] active:scale-[0.97]`}
        onClick={() => setConclusion(`${category}-to-ticket`)}
      >
        <ConvertIcon className="h-8 stroke-white" />
        <div className="mt-2 flex grow flex-col items-center justify-center text-xs">
          Venda
        </div>
      </div>
      <div
        className={`${
          conclusion === `${category}-task-repeat`
            ? "bg-[mediumslateblue]"
            : "bg-gray-400 "
        } flex cursor-pointer flex-col items-center justify-start rounded-md p-2 text-center text-sm font-extrabold uppercase text-white transition hover:scale-[1.03] hover:bg-[mediumpurple] active:scale-[0.97]`}
        onClick={() => setConclusion(`${category}-task-repeat`)}
      >
        <ConvertIcon className="h-8 stroke-white" />
        <div className="mt-2 flex grow flex-col items-center justify-center text-xs">
          Remarcar Contato
        </div>
      </div>

      <div
        className={`${
          conclusion === `${category}-no-contact`
            ? "bg-[mediumslateblue]"
            : "bg-gray-400 "
        } flex cursor-pointer flex-col items-center justify-start rounded-md p-2 text-center text-sm font-extrabold uppercase text-white transition hover:scale-[1.03] hover:bg-[mediumpurple] active:scale-[0.97]`}
        onClick={() => setConclusion(`${category}-no-contact`)}
      >
        <ConvertIcon className="h-8 stroke-white" />
        <div className="mt-2 flex grow flex-col items-center justify-center text-xs">
          Sem contato
        </div>
      </div>
      <div
        className={`${
          conclusion === `${targetType?.toLocaleLowerCase()}-deactivate`
            ? "bg-[mediumslateblue]"
            : "bg-gray-400 "
        } flex cursor-pointer flex-col items-center justify-start rounded-md p-2 text-center text-sm font-extrabold uppercase text-white transition hover:scale-[1.03] hover:bg-[mediumpurple] active:scale-[0.97]`}
        onClick={() =>
          setConclusion(`${targetType?.toLocaleLowerCase()}-deactivate`)
        }
      >
        <ConvertIcon className="h-8 stroke-white" />
        <div className="mt-2 flex grow flex-col items-center justify-center text-xs">
          Desativar {targetType?.toLocaleUpperCase()}
        </div>
      </div>
      <div
        className={`${
          conclusion === `task-cancel` ? "bg-[mediumslateblue]" : "bg-gray-400 "
        } flex cursor-pointer flex-col items-center justify-start rounded-md p-2 text-center text-sm font-extrabold uppercase text-white transition hover:scale-[1.03] hover:bg-[mediumpurple] active:scale-[0.97]`}
        onClick={() => setConclusion(`task-cancel`)}
      >
        <ConvertIcon className="h-8 stroke-white" />
        <div className="mt-2 flex grow flex-col items-center justify-center text-xs">
          Cancelar Tarefa
        </div>
      </div>
    </div>
  );
};

export default GenericTaskConclusionsBox;
