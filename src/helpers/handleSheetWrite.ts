import * as XLSX from "xlsx";

const handleSheetWrite = async () => {
  const table = document.querySelector("table");

  if (!table) return;

  var workbook = XLSX.utils.table_to_book(table);

  const worksheet = XLSX.writeFile(workbook, "Planilha.xlsx");

  console.log(worksheet);
};

export default handleSheetWrite;
