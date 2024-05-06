import { IconLoader2 } from "@tabler/icons-react";

export const BoxLoadingPlaceholder = () => {
  return (
    <div className="flex min-h-[300px] min-w-[300px] items-center justify-center p-12">
      <IconLoader2 className="animate-spin" />
    </div>
  );
};
