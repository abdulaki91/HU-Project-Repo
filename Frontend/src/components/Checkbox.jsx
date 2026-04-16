import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "../utils/utils";

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:border-indigo-500 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/50 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 size-5 shrink-0 rounded-md shadow-sm transition-all outline-none hover:border-indigo-400 dark:hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-all"
      >
        <CheckIcon className="size-4 font-bold" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
