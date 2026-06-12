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
          "bg-mint font-semibold text-[#04120c] shadow-[0_0_0_1px_rgba(116,242,192,0.4),0_10px_30px_-10px_rgba(116,242,192,0.6)] hover:bg-mint-hi hover:shadow-[0_0_0_1px_rgba(166,255,217,0.6),0_14px_38px_-10px_rgba(116,242,192,0.8)]",
        ghost:
          "border-line-2 bg-white/[0.02] text-ink hover:border-white/[0.24] hover:bg-white/[0.06]",
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
