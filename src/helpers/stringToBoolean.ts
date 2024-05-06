export const stringToBoolean = (value: string | string[] | undefined) => {
  if (value === "true") return true;
  return false;
};
