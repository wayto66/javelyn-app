export function getOptimalTextColor(hexColor: string): string {
  // Remove o # do hex da cor
  hexColor = hexColor.replace("#", "");

  // Converte o hex da cor para RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Calcula o brilho da cor usando a fórmula de brilho relativo
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Retorna 'black' se o brilho for maior que 125, caso contrário, retorna 'white'
  return brightness > 125 ? "black" : "white";
}
