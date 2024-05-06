type TParams = {
  className?: string;
  onClick?: (v?: any) => any;
  children: any;
};

const LavenderButton = ({ children, className, onClick }: TParams) => {
  return (
    <button
      className={`rounded-md bg-gradient-to-r from-[lavender] to-violet-100 p-3 text-sm font-bold uppercase text-black transition hover:scale-[1.05] hover:from-[mediumslateblue] hover:to-violet-400 active:scale-[0.96] ${className}`}
      onClick={(e) => (onClick ? onClick(e) : {})}
    >
      {children}
    </button>
  );
};

export default LavenderButton;
