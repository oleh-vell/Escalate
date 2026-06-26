import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center gap-[9px] whitespace-nowrap border border-transparent font-sans font-medium transition-[transform,background,border-color,box-shadow] duration-150 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-mint font-semibold text-white shadow-[0_10px_26px_-12px_rgba(16,185,129,0.85)] hover:bg-mint-hi hover:shadow-[0_14px_32px_-12px_rgba(16,185,129,0.95)]",
        ghost:
          "border-line-2 bg-white text-ink hover:border-mint hover:bg-bg-1",
      },
      size: {
        default: "rounded-[10px] px-[18px] py-[11px] text-[14.5px]",
        sm: "rounded-[9px] px-[14px] py-2 text-[13.5px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
