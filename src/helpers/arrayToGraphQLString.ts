export function arrayToGraphQLString(arr: any[]) {
  if (arr.length === 0) return "[]";

  // Transforma cada objeto do array numa string formatada para GraphQL
  const formatedObjects = arr.map((obj) => {
    const fields = Object.keys(obj)
      .map((key) => {
        const value = obj[key];
        if (!isNaN(value)) return `${key}: ${value}`;
        const formatedValue =
          typeof value === "string" ? `"${value.replace(/"/g, '\\"')}"` : value;
        return `${key}: ${formatedValue}`;
      })
      .join(", ");

    return `{${fields}}`;
  });

  // Junta todos os objetos formatados numa array GraphQL
  return `[${formatedObjects.join(", ")}]`;
}
