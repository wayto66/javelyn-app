export const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="absolute top-[-15px] right-[-15px] z-10 flex">
      <div
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-jred font-extrabold text-white transition hover:scale-[1.07] active:scale-[0.95]"
        onClick={onClick}
      >
        X
      </div>
    </div>
  );
};
