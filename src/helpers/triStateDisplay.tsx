export const triStateDisplay = (state: "1" | "2" | "0" | undefined) => {
  if (state === "1" || !state)
    return (
      <div className="rounded-md bg-gray-500 px-2 py-1 text-center text-white">
        ?
      </div>
    );
  if (state === "2")
    return (
      <div className="rounded-md bg-emerald-500 px-2 py-1 text-center text-white">
        SIM
      </div>
    );
  return (
    <div className="rounded-md bg-red-400 px-2 py-1 text-center text-white">
      NÃO
    </div>
  );
};
