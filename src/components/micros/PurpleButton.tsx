type TParams = {
  className?: string;
  onClick?: (v?: any) => any;
  children: any;
};

const PurpleButton = ({ children, className, onClick }: TParams) => {
  return (
    <button
      className={` rounded-md bg-gradient-to-r from-[mediumslateblue] to-violet-500 p-3 font-extrabold uppercase text-white transition-all duration-[500ms] hover:from-violet-400 hover:to-[mediumslateblue] active:scale-[0.96] ${className}`}
      onClick={(e) => (onClick ? onClick(e) : {})}
    >
      {children}
    </button>
  );
};

export default PurpleButton;
