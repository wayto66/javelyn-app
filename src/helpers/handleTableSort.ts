type TParams = {
  element: HTMLElement | null;
  tableId: string;
  target?: string | null;
  setLoadingOverlapVisibility?: any;
};

const handleTableSort = async (data: TParams) => {
  await data.setLoadingOverlapVisibility(true);
  let sortArray: any = [];
  const tableBody = document.getElementById(data.tableId) as HTMLElement;

  for (var i = 0; i < tableBody.children.length; i++) {
    if (tableBody.children[i]?.tagName != "TR") continue;
    sortArray.push(tableBody.children[i]);
  }

  if (data.element && data.element.dataset.sortTarget) {
    const sortMode = data.element.dataset.sortMode;

    switch (data.element.dataset.sortNumeric) {
      case "true":
        sortArray = sortByNumeric(
          sortArray,
          sortMode,
          data.element.dataset.sortTarget
        );
        break;
      default:
        sortArray = sortByGeneric(
          sortArray,
          sortMode,
          data.element.dataset.sortTarget
        );
        break;
    }

    if (sortMode === "up") {
      data.element.dataset.sortMode = "down";
    } else {
      data.element.dataset.sortMode = "up";
    }
  }

  if (data.target) {
    sortArray = sortByGeneric(sortArray, "up", data.target);
  }

  tableBody.innerHTML = "";
  for (var i = 0; i < sortArray.length; i++) {
    tableBody.appendChild(sortArray[i]);
  }

  data.setLoadingOverlapVisibility(false);
};

export default handleTableSort;

export const sortByGeneric = (
  array: Array<any>,
  sortMode: string | undefined,
  sortTarget: string
) => {
  if (!sortMode) {
    console.log("No sort mode specified");
    return;
  }
  const sortOperators = {
    a: -1,
    b: 1,
  };

  if (sortMode === "up") {
    sortOperators.a = 1;
    sortOperators.b = -1;
  }

  return array.sort(function (a: any, b: any) {
    if (a.dataset[sortTarget] < b.dataset[sortTarget]) return sortOperators.a;

    if (a.dataset[sortTarget] > b.dataset[sortTarget]) return sortOperators.b;

    return 0;
  });
};

export const sortByNumeric = (
  array: Array<any>,
  sortMode: string | undefined,
  sortTarget: string
) => {
  if (!sortMode) {
    console.log("No sort mode specified");
    return;
  }
  const sortOperators = {
    a: 1,
    b: -1,
  };

  if (sortMode === "up") {
    sortOperators.a = -1;
    sortOperators.b = 1;
  }

  return array.sort(function (a: any, b: any) {
    if (a.dataset[sortTarget] == "null") return sortOperators.b;
    if (b.dataset[sortTarget] == "null") return sortOperators.a;
    if (Number(a.dataset[sortTarget]) < Number(b.dataset[sortTarget])) {
      return sortOperators.a;
    }
    if (Number(a.dataset[sortTarget]) > Number(b.dataset[sortTarget])) {
      return sortOperators.b;
    }
    return 0;
  });
};
