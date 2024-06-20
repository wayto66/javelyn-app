const localeMap = new Map<string, string>([
  ["BOOLEAN", "SIM OU NÃO"],
  ["NUMBER", "NÚMERO"],
  ["STRING", "TEXTO"],
  ["PRODUCT", "PRODUTO"],
  ["QUOTE", "ORÇAMENTO"],
  ["PHONE", "Telefone"],
  ["MAIL", "Email"],
]);

export const Locale = (text: string): string => {
  return localeMap.get(text.toUpperCase()) ?? text;
};
