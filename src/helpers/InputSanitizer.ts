export class InputSanitizer {
  static phone(input: string): string {
    let phone = input;
    phone = phone
      .trim()
      .replaceAll("+", "")
      .replaceAll(" ", "")
      .replaceAll("-", "")
      .replaceAll("(", "")
      .replaceAll(")", "");

    return phone;
  }
}
