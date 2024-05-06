export const jsonToGraphQLString = (obj: object | null | undefined): string => {
  if (!obj) return "";
  const keyValuePairs = Object.entries(obj).map(([key, value]) => {
    if (typeof value === "string") {
      return `${key}: "${value.replace(/"/g, '\\"')}"`; // Escapar aspas duplas
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return `${key}: ${value}`;
    }
    if (Array.isArray(value)) {
      const arrayValues = value
        .map((item) => `{${jsonToGraphQLObject(item)}}`)
        .join(", ");
      return `${key}: [${arrayValues}]`;
    }
    if (typeof value === "object") {
      return `${key}: {${jsonToGraphQLString(value)}}`;
    }
    return "";
  });

  return keyValuePairs.join(", ");
};

function jsonToGraphQLObject(obj: object) {
  const fields = Object.entries(obj).map(([key, value]) => {
    return `${jsonToGraphQLString({ [key]: value })}`;
  });
  return fields.join(", ");
}
