type TParams = {
  name: string;
  className?: string;
  values: {
    label: string | JSX.Element;
    value: string | number | undefined;
    extra?: string | number;
  }[];
  icon: JSX.Element;
  backTable: {
    labels: (string | JSX.Element)[];
    rows: (string | number)[][] | undefined;
  };
};

const DataThumb = ({ name, values, icon, className, backTable }: TParams) => {
  return (
    <div
      className={`group relative flex flex-col rounded-md border-gray-500 bg-gray-50 p-4 shadow-lg transition-all active:scale-[0.97] ${className}`}
    >
      <div className="absolute top-0 left-0 z-[6] h-0 min-h-[full] w-full overflow-hidden rounded-md bg-[mediumslateblue] p-1 shadow-2xl transition-all hover:h-[max-content] hover:min-h-full hover:p-3 ">
        <table className="h-full w-full p-3 text-white">
          <thead className="mt-6 rounded-t-md bg-[lavender] text-black">
            {backTable.labels.map((label) => (
              <th>{label}</th>
            ))}
          </thead>
          <tbody className="mt-2">
            {backTable.rows?.map((row) => (
              <tr className="border-b">
                {row.map((v) => (
                  <td className="mx-2">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-3 items-center">
        {icon}
        <span className="col-span-2 border-b-[3px] border-violet-500 pb-1 text-end text-xl font-extrabold uppercase text-[mediumslateblue]">
          {name}
        </span>
      </div>
      <div className="mt-4 grid w-full grow grid-cols-2 items-center justify-center gap-5  text-2xl font-bold">
        {values.map((v) => (
          <div className="flex flex-col">
            <div className="flex flex-row items-end gap-1">
              <span>
                {" "}
                {v.value ?? <span className="text-sm">Carregando...</span>}
              </span>
              <div className="text-sm text-[mediumslateblue]">
                {v.extra ? `(${v.extra})` : undefined}
              </div>
            </div>
            <div className="mt-[-5px] text-sm text-gray-500">{v.label}</div>{" "}
          </div>
        )) ?? <span className="text-sm text-gray-500">Carregando...</span>}
      </div>
    </div>
  );
};

export default DataThumb;
