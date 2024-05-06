const taskCategoryToTailwindBg = (category: string) => {
  if (category === "PÓS-VENDA")
    return " bg-gradient-to-r  from-teal-500  to-emerald-500";
  if (category === "CLIENTE")
    return " bg-gradient-to-r  from-orange-500  to-yellow-600";
  if (category === "ORÇAMENTO")
    return " bg-gradient-to-r  from-blue-500  to-[MediumSlateBlue]";
  if (category === "FALTA") return " bg-gradient-to-r  from-jred  to-[crimson]";
  if (category === "RETORNO")
    return " bg-gradient-to-r  from-pink-500  to-[deeppink]";
  return " bg-gradient-to-r  from-violet-500  to-purple-500";
};

export default taskCategoryToTailwindBg;
