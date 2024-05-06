export const percentageOf = (
  a: number | undefined,
  b: number | undefined
): string => {
  if (!a || !a || !b || b === 0) return "...";
  return ((a / b) * 100).toFixed(2) + "%";
};
