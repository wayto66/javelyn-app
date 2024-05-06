import { env } from "process";
import { toast } from "react-toastify";
import { read, utils } from "xlsx";
import fetchDbData from "./fetchDbData";

type TParams = {
  setLoadingOverlapVisibility?: any;
  companyId: number;
};

const handleSheetReader = async (inputData: TParams) => {
  const input = document.querySelector("#sheet-input") as HTMLInputElement;
  if (!input) return;
  if (!input.files || !input.files[0]) {
    toast("escolha o arquivo da planilha");
    return;
  }
  inputData.setLoadingOverlapVisibility(true);
  const file = await input.files[0].arrayBuffer();
  const wb = read(file);
  if (
    !wb ||
    !wb.SheetNames ||
    !wb.SheetNames[0] ||
    !wb.Sheets[wb.SheetNames[0]]
  )
    return;
  const data = utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]!);

  let lastValidClientIndex = 0;

  const ticketArray: any = [];

  for (let i = 0; i < data.length; i++) {
    if (!data[i].Cliente) {
      if (!data[i].Serviços) continue;
      ticketArray[lastValidClientIndex].Serviços.push(
        data[i].Serviços.slice(0, data[i].Serviços.indexOf("R$")).trim()
      );
      continue;
    }

    const cpfcheck = Number(data[i].Cliente.replace(/[\.-]/g, ""));

    if (!isNaN(cpfcheck)) {
      if (!data[i].Serviços) continue;
      ticketArray[lastValidClientIndex].Serviços.push(
        data[i].Serviços.slice(0, data[i].Serviços.indexOf("R$")).trim()
      );
      continue;
    }

    ticketArray[i] = { ...data[i] };
    ticketArray[i].Data = ExcelDateToJSDate(data[i].Data, data[i].Cliente);
    ticketArray[i].CompanyId = inputData.companyId;
    ticketArray[i].Serviços = [
      data[i].Serviços.slice(0, data[i].Serviços.indexOf("R$")).trim(),
    ];
    lastValidClientIndex = i;
  }

  const finalArray = ticketArray.sort().filter(
    (a: any) =>
      function () {
        return a != null;
      }
  );

  const postData = await fetch("https://" + env.JAVELYN_LINK + "/spreadsheet", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalArray),
  })
    .catch((err) => {
      console.log(err);
      return err;
    })
    .then((response) => response.json())
    .then(function (data) {
      return data;
    });
  inputData.setLoadingOverlapVisibility(false);
};

const handleSheetReader_Situational1 = async (inputData: TParams) => {
  const input = document.querySelector("#sheet-input") as HTMLInputElement;
  if (!input) return;
  if (!input.files || !input.files[0]) {
    toast("escolha o arquivo da planilha");
    return;
  }
  // inputData.setLoadingOverlapVisibility(true);
  const file = await input.files[0].arrayBuffer();
  const wb = read(file);
  if (
    !wb ||
    !wb.SheetNames ||
    !wb.SheetNames[0] ||
    !wb.Sheets[wb.SheetNames[0]]
  )
    return;
  const clientsData = utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]!);

  for (const client of clientsData) {
    console.log({ client });
    await fetchDbData({
      path: "client/upsert",
      method: "PATCH",
      data: {
        where: {
          companyId_name: {
            companyId: inputData.companyId,
            name: client.NOME,
          },
        },
        update: {
          adress: client["RUA/AV"] === "S/R" ? undefined : client["RUA/AV"],
          phone: client.TELEFONE?.toString()
            .replace("-", "")
            .replace("-", "")
            .replace("-", ""),
          birthday: ExcelDateToJSDate(client.NASCIMENTO),
          houseNumber:
            client.NÚMERO === "S/R" ? undefined : Number(client.NÚMERO),
          neighborhood: client.BAIRRO,
          zipCode:
            client.CEP === "S/R"
              ? undefined
              : client.CEP?.toString().replace("-", "").replace("-", ""),
        },
        create: {
          name: client.NOME,
          companyId: inputData.companyId,
          adress: client["RUA/AV"] === "S/R" ? undefined : client["RUA/AV"],
          phone: client.TELEFONE?.toString()
            .replace("-", "")
            .replace("-", "")
            .replace("-", ""),
          birthday: ExcelDateToJSDate(client.NASCIMENTO),
          houseNumber:
            client.NÚMERO === "S/R" ? undefined : Number(client.NÚMERO),
          neighborhood: client.BAIRRO,
          zipCode:
            client.CEP === "S/R"
              ? undefined
              : client.CEP?.toString().replace("-", "").replace("-", ""),
        },
      },
    });
  }

  inputData.setLoadingOverlapVisibility(false);
};

export default handleSheetReader;

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
