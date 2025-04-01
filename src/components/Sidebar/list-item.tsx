import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import React from "react";

export default function ListItem({
  className,
  children,
  checked,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  checked: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      //   ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      //   {...props}
    >
      {checked && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <div>
            <CheckIcon className="h-4 w-4" />
          </div>
        </span>
      )}
      <p>{children}</p>
    </div>
  );
}
