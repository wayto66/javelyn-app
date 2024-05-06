const handleConclusionCategoryDisplay = (
  conclusionCategory: string | undefined,
  concluded?: boolean
) => {
  if (!conclusionCategory)
    return (
      <span className="mt-2 rounded-md bg-gray-500 px-2 py-1 font-bold text-white">
        {" "}
        CONCLUSÃO INDEFINIDA
      </span>
    );
  const conclusionDisplayMap = new Map<string, JSX.Element>([
    [
      "LEAD-NO-CONTACT",
      <span className="mt-2 w-full rounded-md bg-jred px-2 py-1 font-bold text-white">
        {" "}
        NÃO RESPONDEU{" "}
      </span>,
    ],
    [
      "EVALUATION-TO-TASK",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 text-center font-bold text-white">
        {" "}
        AVALIAÇÃO PARA TASK
      </span>,
    ],
    [
      "EVALUATION-TO-RESCHEDULE",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 text-center font-bold text-white">
        {" "}
        AVALIAÇÃO REMARCADA
      </span>,
    ],
    [
      "EVALUATION-TO-DEACTIVATE",
      <span className="mt-2 w-full rounded-md bg-jred px-2 py-1 text-center font-bold text-white">
        {" "}
        AVALIAÇÃO PARA DESATIVAMENTO
      </span>,
    ],
    [
      "EVALUATION-TO-TICKET",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 text-center font-bold text-white">
        {" "}
        CONVERSÃO: AVALIAÇÃO PARA VENDA
      </span>,
    ],
    [
      "EVALUATION-TO-QUOTE",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 text-center font-bold text-white">
        {" "}
        CONVERSÃO: AVALIAÇÃO PARA ORÇAMENTO
      </span>,
    ],
    [
      "RETURN-TO-QUOTE",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 text-center font-bold text-white">
        {" "}
        CONVERSÃO: RETORNO PARA ORÇAMENTO
      </span>,
    ],
    [
      "QUOTE-TO-TICKET",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 text-center font-bold text-white">
        {" "}
        CONVERSÃO: ORÇAMENTO PARA VENDA
      </span>,
    ],
    [
      "TASK-TO-TICKET",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 text-center font-bold text-white">
        {" "}
        CONVERSÃO: TAREFA PARA VENDA
      </span>,
    ],
    [
      "LEAD-TASK-REPEAT",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 font-bold text-white">
        {" "}
        REMARCADO PARA NOVA TAREFA{" "}
      </span>,
    ],
    [
      "LEAD-TO-EVALUATION",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 font-bold text-white">
        {" "}
        CONVERSÃO: LEAD PARA AVALIAÇÃO{" "}
      </span>,
    ],
    [
      "QUOTE-TASK-REPEAT",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 font-bold text-white">
        {" "}
        ORÇAMENTO: CONTATO REMARCADO{" "}
      </span>,
    ],
    [
      "QUOTE-NO-CONTACT",
      <span className="mt-2 w-full rounded-md bg-jred px-2 py-1 font-bold text-white">
        {" "}
        ORÇAMENTO: SEM CONTATO, REMARCADO{" "}
      </span>,
    ],
    [
      "LEAD-TO-QUOTE",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 font-bold text-white">
        {" "}
        CONVERSÃO: LEAD PARA ORÇAMENTO{" "}
      </span>,
    ],
    [
      "EVALUATION-RESCHEDULED",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 font-bold text-white">
        {" "}
        AVALIAÇÃO REMARCADA
      </span>,
    ],
    [
      "RETURN-TO-EVALUATION",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 font-bold text-white">
        {" "}
        CONVERSÃO: RETORNO PARA AVALIAÇÃO
      </span>,
    ],
    [
      "TASK-TO-LEAD-DEACTIVATION",
      <span className="mt-2 w-full rounded-md bg-jred px-2 py-1 font-bold text-white">
        {" "}
        LEAD DESATIVADO
      </span>,
    ],
    [
      "ABSENCE-NO-CONTACT",
      <span className="mt-2 w-full rounded-md bg-jred px-2 py-1 font-bold text-white">
        {" "}
        RESGATE FALTA - SEM CONTATO
      </span>,
    ],
    [
      "TASK-TO-RESCHEDULE",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 font-bold text-white">
        {" "}
        REMARCADO
      </span>,
    ],
    [
      "TASK-TO-RESCUE",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 font-bold text-white">
        {" "}
        ENVIADO PARA RESGATE
      </span>,
    ],
    [
      "TASK-TO-CLIENT-DEACTIVATION",
      <span className="mt-2 w-full rounded-md bg-jred px-2 py-1 font-bold text-white">
        {" "}
        CLIENTE DESATIVADO
      </span>,
    ],
    [
      "TASK-CANCEL",
      <span className="mt-2 w-full rounded-md bg-orange-500 px-2 py-1 font-bold text-white">
        {" "}
        TAREFA CANCELADA
      </span>,
    ],
    [
      "TASK-TO-QUOTE-DEACTIVATION",
      <span className="mt-2 w-full rounded-md bg-jred px-2 py-1 font-bold text-white">
        {" "}
        ORÇAMENTO DESATIVADO
      </span>,
    ],
    [
      "CLIENT-TO-EVALUATION",
      <span className="mt-2 w-full rounded-md bg-teal-500 px-2 py-1 font-bold text-white">
        {" "}
        CONVERSÃO: CLIENTE PARA AVALIAÇÃO
      </span>,
    ],
    [
      "TASK-FINISH",
      <span className="mt-2 w-full rounded-md bg-blue-500 px-2 py-1 font-bold text-white">
        {" "}
        TAREFA ENCERRADA
      </span>,
    ],
    [
      "INDEFINIDO",
      <span className="mt-2 w-full  rounded-md bg-yellow-400 px-2 py-1 font-bold text-black">
        {" "}
        EM ABERTO{" "}
      </span>,
    ],
  ]);

  if (conclusionCategory === "INDEFINIDO" && concluded)
    return (
      <span className="mt-2 rounded-md bg-teal-500 px-2 py-1 font-bold text-white">
        {" "}
        CONCLUÍDA
      </span>
    );
  return (
    conclusionDisplayMap.get(conclusionCategory) ?? (
      <span className="mt-2 rounded-md bg-gray-500 px-2 py-1 font-bold text-white">
        {" "}
        CONCLUSÃO INDEFINIDA: {conclusionCategory}
      </span>
    )
  );
};

export default handleConclusionCategoryDisplay;
