import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-full border font-mono text-[11px]",
  {
    variants: {
      variant: {
        outline:
          "border-[rgba(116,242,192,0.3)] bg-[rgba(116,242,192,0.05)] px-[10px] py-1 text-mint",
        pending:
          "gap-[7px] border-[rgba(255,194,77,0.35)] bg-[rgba(255,194,77,0.07)] px-[9px] py-[3px] text-amber",
        responded:
          "gap-[7px] border-[rgba(116,242,192,0.35)] bg-[rgba(116,242,192,0.07)] px-[9px] py-[3px] text-mint",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
