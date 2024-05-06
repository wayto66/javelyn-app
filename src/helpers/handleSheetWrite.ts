import * as XLSX from "xlsx";

type TParams = {
  setLoadingOverlapVisibility?: any;
};

const handleSheetWrite = async (inputData: TParams) => {
  const table = document.querySelector("table");

  if (!table) return;

  var workbook = XLSX.utils.table_to_book(table);

  const worksheet = XLSX.writeFile(workbook, "Planilha.xlsx");

  console.log(worksheet);
  inputData.setLoadingOverlapVisibility(false);
};

export default handleSheetWrite;
