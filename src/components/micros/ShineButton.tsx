import { bg, $, w, x } from "@fullcalendar/core/internal-common";
import { h } from "@fullcalendar/core/preact";
import { text } from "stream/consumers";

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
  disabled?: boolean;
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
  disabled,
}: TShineButtonParams) => {
  const defaultClassName = `${
    disabled ? "opacity-80" : ""
  }  transition group relative hover:opacity-80 overflow-visible rounded-md bg-${
    active ? activeButtonColor ?? "jpurple" : buttonColor ?? "secondary"
  } px-6 py-2 font-semibold text-${
    active ? activeTextColor ?? "white" : textColor ?? "white"
  } `;

  return (
    <button
      id={id}
      key={(id ?? "button-") + Math.random()}
      className={defaultClassName + className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      <div
        className={`absolute left-[-25px] top-0 h-full min-h-[50px] w-[50px] skew-x-12 bg-${
          shineColor ?? "white"
        }/60 z-[5] transition-all duration-[250ms] group-hover:translate-x-[700%]`}
      ></div>
    </button>
  );
};
