import { useState } from "react";
import { cn } from "./utils";
export function Accordion({ children, type="single", className }) { return <div className={cn("w-full",className)} data-accordion-type={type}>{children}</div>; }
export function AccordionItem({ value, children, className }) { const [open,setOpen]=useState(false); return <div className={cn("border-b",className)} data-value={value}><div>{children}</div></div>; }
export function AccordionTrigger({ children, className, onClick, ...p }) { return <button type="button" onClick={onClick} className={cn("flex w-full items-center justify-between py-4 text-left font-medium",className)} {...p}>{children}</button>; }
export function AccordionContent({ children, className }) { return <div className={cn("pb-4 text-sm text-muted-foreground",className)}>{children}</div>; }
