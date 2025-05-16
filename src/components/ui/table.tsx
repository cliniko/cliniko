import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    isLoading?: boolean;
    responsive?: boolean;
  }
>(({ className, isLoading, responsive = true, ...props }, ref) => (
  <div className={cn(
    "relative w-full",
    responsive && "overflow-auto",
    isLoading && "min-h-[200px]",
  )}>
    {responsive && (
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 transition-opacity ease-in-out duration-300 sm:peer-hover:opacity-100" />
    )}
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm",
        responsive && "peer", 
        className
      )}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky = false, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      sticky && "sticky top-0 bg-background z-10",
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { 
    isEmpty?: boolean;
    isLoading?: boolean;
    emptyContent?: React.ReactNode;
    loadingContent?: React.ReactNode;
  }
>(({ className, isEmpty, isLoading, emptyContent, loadingContent, ...props }, ref) => {
  if (isLoading) {
    return (
      <tbody ref={ref} className={cn(className)} {...props}>
        <tr>
          <td 
            colSpan={100} 
            className="h-[200px] text-center align-middle text-muted-foreground p-8"
          >
            {loadingContent || (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-2 text-sm">Loading...</p>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    )
  }
  
  if (isEmpty) {
    return (
      <tbody ref={ref} className={cn(className)} {...props}>
        <tr>
          <td 
            colSpan={100} 
            className="h-[200px] text-center align-middle text-muted-foreground p-8"
          >
            {emptyContent || "No data available"}
          </td>
        </tr>
      </tbody>
    )
  }
  
  return <tbody ref={ref} className={cn(className)} {...props} />
})
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-muted/50 font-medium", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    isHoverable?: boolean;
    isSelected?: boolean;
  }
>(({ className, isHoverable = true, isSelected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors",
      isHoverable && "hover:bg-muted/50 data-[state=selected]:bg-muted",
      isSelected && "bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    isSortable?: boolean;
    sortDirection?: "asc" | "desc" | null;
  }
>(({ className, children, isSortable, sortDirection, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      isSortable && "cursor-pointer select-none",
      className
    )}
    {...props}
  >
    {isSortable ? (
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {sortDirection === "asc" && (
          <span className="sr-only">(sorted ascending)</span>
        )}
        {sortDirection === "desc" && (
          <span className="sr-only">(sorted descending)</span>
        )}
        <span aria-hidden="true" className="select-none opacity-70">
          {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : "↕"}
        </span>
      </div>
    ) : (
      children
    )}
  </th>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    truncate?: boolean;
    maxWidth?: string;
  }
>(({ className, truncate, maxWidth, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      truncate && "truncate",
      className
    )}
    style={maxWidth ? { maxWidth } : undefined}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
