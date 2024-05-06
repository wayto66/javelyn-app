export const triToggleValueConvert = (value: "0" | "1" | "2") => {
  if (value === "0") return false;
  if (value === "2") return true;
  return undefined;
};
