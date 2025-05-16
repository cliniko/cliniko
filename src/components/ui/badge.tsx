import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        success: 
          "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200/80",
        warning: 
          "bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200/80",
        danger: 
          "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200/80",
        info: 
          "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200/80",
        medical: 
          "border text-foreground",
        // Role-specific variants
        doctor: 
          "bg-medical-doctor/10 text-medical-doctor border border-medical-doctor/20 hover:bg-medical-doctor/20",
        nurse: 
          "bg-medical-nurse/10 text-medical-nurse border border-medical-nurse/20 hover:bg-medical-nurse/20",
        admin: 
          "bg-medical-admin/10 text-medical-admin border border-medical-admin/20 hover:bg-medical-admin/20",
        staff: 
          "bg-medical-staff/10 text-medical-staff border border-medical-staff/20 hover:bg-medical-staff/20",
        // Status-specific variants
        scheduled: 
          "bg-medical-nurse/10 text-medical-nurse border border-medical-nurse/20 hover:bg-medical-nurse/20",
        completed: 
          "bg-medical-doctor/10 text-medical-doctor border border-medical-doctor/20 hover:bg-medical-doctor/20",
        cancelled: 
          "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200/80",
        pending: 
          "bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200/80",
      },
      size: {
        default: "h-6 text-xs",
        sm: "h-5 text-[10px]",
        lg: "h-7 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  role?: string;
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div 
      role="status" 
      aria-label={props["aria-label"] || props.children?.toString()} 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
