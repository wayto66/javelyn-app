type TParams = {
  children: JSX.Element | JSX.Element[] | string;
  onClick?: (d?: any) => any;
  className?: string;
  type?: "button" | "submit";
};

export const DefaultButton = ({
  children,
  onClick,
  className,
  type,
}: TParams) => {
  return (
    <button
      className={`${className} rounded-md bg-jpurple px-4 py-1 font-semibold text-white transition hover:bg-jpurple/80`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};
