import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import cn from "clsx";

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
} & TooltipPrimitive.TooltipContentProps &
  React.RefAttributes<HTMLDivElement>) {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        side="top"
        align="center"
        className={cn(
          "rounded-md px-4 py-3 bg-black dark:bg-gray-500 shadow-md text-white",
          className
        )}
        {...props}
      >
        {content}
        <TooltipPrimitive.Arrow className="text-black dark:text-gray-500 fill-current mt-[-0.1rem]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
}
