const startTooltips = () => {
  const objects: NodeListOf<Element> =
    document.querySelectorAll("[data-tooltip]");

  for (let i = 0; i < objects.length; i++) {
    objects[i]?.classList.add("relative");
    objects[i]?.addEventListener("mouseenter", () => {
      const tooltipElement = document.createElement("div");
      tooltipElement.className =
        "absolute bottom-[110%] left-0 z-[999] bg-black/50 text-white px-2 py-1 rounded-md text-xs backdrop-blur-[1px]";
      tooltipElement.id = "tooltip-element";
      tooltipElement.innerHTML =
        objects[i]?.getAttribute("data-tooltip") || "no tooltip";
      objects[i]?.appendChild(tooltipElement);
    });
    objects[i]?.addEventListener("mouseleave", () => {
      const tooltipElement = objects[i]?.querySelector("#tooltip-element");
      if (tooltipElement) {
        tooltipElement.remove();
      }
    });
  }
};

export default startTooltips;
