export function normalizeStringForGraphQL(input: string): string {
  // Mapeamento de caracteres especiais para seus equivalentes
  const charMap: { [key: string]: string } = {
    À: "A",
    Á: "A",
    Â: "A",
    Ã: "A",
    Ä: "A",
    Å: "A",
    à: "a",
    á: "a",
    â: "a",
    ã: "a",
    ä: "a",
    å: "a",
    Ò: "O",
    Ó: "O",
    Ô: "O",
    Õ: "O",
    Ö: "O",
    Ø: "O",
    ò: "o",
    ó: "o",
    ô: "o",
    õ: "o",
    ö: "o",
    ø: "o",
    È: "E",
    É: "E",
    Ê: "E",
    Ë: "E",
    è: "e",
    é: "e",
    ê: "e",
    ë: "e",
    Ç: "C",
    ç: "c",
    Ì: "I",
    Í: "I",
    Î: "I",
    Ï: "I",
    ì: "i",
    í: "i",
    î: "i",
    ï: "i",
    Ù: "U",
    Ú: "U",
    Û: "U",
    Ü: "U",
    ù: "u",
    ú: "u",
    û: "u",
    ü: "u",
    ÿ: "y",
    Ñ: "N",
    ñ: "n",
  };

  let normalizedString = "";
  for (const char of input) {
    normalizedString += charMap[char] || char;
  }

  return sanitizeKey(normalizedString);
}

function sanitizeKey(input: string): string {
  // Remove caracteres especiais, exceto underscore (_)
  let sanitized = input.replace(/[^\w\s]|_/g, "").replace(/\s+/g, "_");

  // Verifica se o primeiro caractere é um dígito e, se for, adiciona um prefixo
  if (sanitized.match(/^\d/)) {
    sanitized = `_${sanitized}`;
  }

  return sanitized;
}
