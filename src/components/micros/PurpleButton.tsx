import { MouseEvent } from "react";

type TParams = {
  className?: string;
  onClick?: (e?: any) => any;
  children: any;
  disabled?: boolean;
};

const PurpleButton = ({ children, className, onClick, disabled }: TParams) => {
  return (
    <button
      className={` rounded-md ${
        disabled
          ? "bg-gray-700 !opacity-50"
          : "bg-gradient-to-r from-[mediumslateblue] to-violet-500"
      }  p-3 font-extrabold uppercase text-white transition-all duration-[500ms] hover:from-violet-400 hover:to-[mediumslateblue] active:scale-[0.96] ${className}`}
      onClick={(e) => (onClick ? onClick(e) : {})}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default PurpleButton;
