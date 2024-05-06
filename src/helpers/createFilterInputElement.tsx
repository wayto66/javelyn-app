type TParams = {
  filterType: string;
  uniqueId: number;
  setFilterElements?: any;
};

const createFilterInputElement = (data: TParams) => {
  const handleFilterValueUpdate = (inputId: string, idToFind: number) => {
    const e = document.getElementById(inputId);
    console.log(e);
    data.setFilterElements((prevState: any) => {
      const filters = [...prevState];
      const index = filters.findIndex((filter) => filter.key == idToFind);
      if (index !== -1) {
        filters[index] = {
          ...filters[index],
          filterParameters: {
            ...filters[index]?.filterParameters,
            value: (e as HTMLInputElement).value,
          },
        };
      }
      return filters;
    });
  };

  let staticElement;

  switch (data.filterType) {
    default:
      staticElement = createTextInput(data.uniqueId, handleFilterValueUpdate);
      break;
    case "statusActive":
      staticElement = createBooleanInput(
        data.uniqueId,
        handleFilterValueUpdate
      );
      break;
    case "statusAvailableToReturn":
      staticElement = createBooleanInput(
        data.uniqueId,
        handleFilterValueUpdate
      );
      break;
    case "absences":
      staticElement = createNumberInput(data.uniqueId, handleFilterValueUpdate);
      break;
    case "age":
      staticElement = createNumberInput(data.uniqueId, handleFilterValueUpdate);
      break;
    case "rank":
      staticElement = createNumberInput(data.uniqueId, handleFilterValueUpdate);
      break;
    case "totalSpent":
      staticElement = createNumberInput(data.uniqueId, handleFilterValueUpdate);
      break;
    case "ticketCount":
      staticElement = createNumberInput(data.uniqueId, handleFilterValueUpdate);
      break;
    case "daysSinceLastTicket":
      staticElement = createNumberInput(data.uniqueId, handleFilterValueUpdate);
      break;
  }

  return staticElement;
};

export default createFilterInputElement;

export function createBooleanInput(
  uniqueId: number,
  handleFilterValueUpdate: any
) {
  const select = document.createElement("select");
  select.id = "filter-input-" + uniqueId;
  select.name = "client-filter-type-select";
  select.setAttribute("className", "rounded-md border");
  select.setAttribute("defaultValue", "true");
  select.addEventListener("change", () =>
    handleFilterValueUpdate("filter-input-" + uniqueId, uniqueId)
  );

  const option1 = document.createElement("option");
  option1.value = "true";
  option1.innerText = "Sim";
  select.appendChild(option1);

  const option2 = document.createElement("option");
  option2.value = "false";
  option2.innerText = "Não";
  select.appendChild(option2);

  return select;
}

export function createTextInput(
  uniqueId: number,
  handleFilterValueUpdate: any
) {
  const input = document.createElement("input");
  input.id = "filter-input-" + uniqueId;
  input.name = "client-filter-type-input";
  input.type = "text";
  input.setAttribute("className", "rounded-md border");
  input.addEventListener("change", () =>
    handleFilterValueUpdate("filter-input-" + uniqueId, uniqueId)
  );

  return input;
}

export function createNumberInput(
  uniqueId: number,
  handleFilterValueUpdate: any
) {
  const input = document.createElement("input");
  input.id = "filter-input-" + uniqueId;
  input.name = "client-filter-type-input";
  input.type = "number";
  input.setAttribute("className", "rounded-md border");
  input.addEventListener("change", () =>
    handleFilterValueUpdate("filter-input-" + uniqueId, uniqueId)
  );

  return input;
}
