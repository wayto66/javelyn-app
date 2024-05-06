type TParams = {
  element: HTMLElement | HTMLInputElement | null;
  classNames: string;
  group: string;
};

const markSelectedObject = (data: TParams) => {
  if (!data.element) {
    console.error("No element provided.");
    return;
  }

  const previousSelectedObject = document.querySelector(
    `[data-select-object][data-select-group=${data.group}]`
  );
  if (previousSelectedObject) {
    const classNames = previousSelectedObject
      .getAttribute("data-select-class-names")
      ?.split(" ");

    if (classNames) {
      for (const className of classNames) {
        previousSelectedObject.classList.remove(className);
      }
    }

    previousSelectedObject.removeAttribute("data-select-object");
  }

  const classNames = data.classNames.split(" ");

  for (const className of classNames) {
    data.element.classList.add(className);
  }

  data.element.setAttribute("data-select-object", "true");
  data.element.setAttribute("data-select-class-names", data.classNames);
  data.element.setAttribute("data-select-group", data.group);
};

export default markSelectedObject;
