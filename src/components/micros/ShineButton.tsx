type TShineButtonParams = {
  children: (JSX.Element | string) | (JSX.Element | string)[];
  id?: string;
  textColor?: string;
  buttonColor?: string;
  shineColor?: string;
  className?: string;
  activeButtonColor?: string;
  activeTextColor?: string;
  onClick?: (data?: any) => any;
  active?: boolean;
};

export const ShineButton = ({
  children,
  id,
  textColor,
  className,
  buttonColor,
  activeButtonColor,
  activeTextColor,
  shineColor,
  onClick,
  active,
}: TShineButtonParams) => {
  const defaultClassName = `hover:scale-[1.02]  transition group relative overflow-hidden rounded-md bg-${
    active ? activeButtonColor ?? "jpurple" : buttonColor ?? "secondary"
  } px-6 py-2 font-semibold text-${
    active ? activeTextColor ?? "white" : textColor ?? "white"
  } `;

  return (
    <button
      id={id}
      key={(id ?? "button-") + Math.random()}
      className={defaultClassName + className}
      onClick={(e) => (onClick ? onClick(e) : {})}
    >
      {children}
      <div
        className={`absolute left-[-75px] top-0 h-full w-[50px] skew-x-12 bg-${
          shineColor ?? "white"
        }/60 transition duration-[250ms] group-hover:translate-x-[700%]`}
      ></div>
    </button>
  );
};
