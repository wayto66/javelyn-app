import { read, utils } from "xlsx";

export const sheetToJson = async (
  inputFile: File
): Promise<undefined | any[]> => {
  const file = await inputFile.arrayBuffer();
  const wb = read(file, {});
  if (
    !wb ||
    !wb.SheetNames ||
    !wb.SheetNames[0] ||
    !wb.Sheets[wb.SheetNames[0]]
  )
    return;
  const data = utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]!);
  return data;
};

function ExcelDateToJSDate(dateSerial: number | string, clientName?: string) {
  let date;
  if (typeof dateSerial === "string") {
    const day = dateSerial.slice(0, dateSerial.indexOf("/")).trim();
    const month = dateSerial
      .slice(dateSerial.indexOf("/") + 1, 99999)
      .slice(0, dateSerial.indexOf("/") - 1)
      .trim();

    const rest = dateSerial
      .slice(dateSerial.indexOf("/") + 1, 99999)
      .slice(dateSerial.indexOf("/"), 99999);

    const fixedDate = month + "/" + day + "/" + rest;
    date = new Date(fixedDate);
    return date;
  }
  date = new Date(Math.round((dateSerial - 25569) * 864e5));
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date;
}
