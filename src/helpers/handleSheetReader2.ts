import { env } from "process";
import { toast } from "react-toastify";
import { read, utils } from "xlsx";

// this one is for the birthdays and phones sheet.

type TParams = {
  setLoadingOverlapVisibility: any;
  companyId: number;
};

const handleSheetReader2 = async (inputData: TParams) => {
  const input = document.querySelector("#sheet-input2") as HTMLInputElement;
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

  const ticketArray: any = [];
  const todayDate = new Date();
  const todayYear = todayDate.getFullYear();

  for (let i = 0; i < data.length; i++) {
    ticketArray[i] = { ...data[i] };
    ticketArray[i].Nome = ticketArray[i].Nome.replace(
      /[^a-zA-Z\s]/g,
      ""
    ).trim();
    const niver = data[i].Nome.replace(/[^0-9\-/\\]/g, "")
      .replace("/", "-")
      .trim();
    const niverSplit = niver.split("-");
    ticketArray[i].Aniversario = `${niverSplit[1]}-${niverSplit[0]}-${
      todayYear - Number(ticketArray[i].Idade)
    }`;
    console.log(niverSplit[0], niverSplit[1]);
    if (ticketArray[i].Telefone) {
      ticketArray[i].Telefone = ticketArray[i].Telefone.replace(
        /\D/g,
        ""
      ).trim();
    }
    if (ticketArray[i].Celular)
      ticketArray[i].Celular = ticketArray[i].Celular.replace(/\D/g, "").trim();
    if (ticketArray[i].Whatsapp)
      ticketArray[i].Whatsapp = ticketArray[i].Whatsapp.replace(
        /\D/g,
        ""
      ).trim();
  }

  const finalArray = ticketArray.sort().filter(
    (a: any) =>
      function () {
        return a != null;
      }
  );

  const postData = await fetch(
    "https://" + env.JAVELYN_LINK + "/spreadsheet/hbd",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: finalArray,
        companyId: inputData.companyId,
      }),
    }
  )
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

export default handleSheetReader2;
