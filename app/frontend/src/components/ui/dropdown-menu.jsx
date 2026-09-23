import { createContext, useContext, useState } from "react";
import { cn } from "./utils";
const Ctx=createContext(null);
export function DropdownMenu({children}){const [open,setOpen]=useState(false);return <Ctx.Provider value={{open,setOpen}}><div className="relative inline-block">{children}</div></Ctx.Provider>}
export function DropdownMenuTrigger({asChild,children,...p}){const {setOpen}=useContext(Ctx);return asChild?<span onClick={()=>setOpen(v=>!v)}>{children}</span>:<button type="button" onClick={()=>setOpen(v=>!v)} {...p}>{children}</button>}
export function DropdownMenuContent({className,children}){const {open}=useContext(Ctx);if(!open)return null;return <div className={cn("absolute right-0 z-50 mt-2 min-w-48 rounded-md border bg-background p-1 shadow-lg",className)}>{children}</div>}
export function DropdownMenuItem({className,children,onClick,...p}){const {setOpen}=useContext(Ctx);return <button type="button" onClick={e=>{onClick?.(e);setOpen(false)}} className={cn("flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted",className)} {...p}>{children}</button>}
export function DropdownMenuSeparator(){return <div className="my-1 h-px bg-border"/>}
