import { createContext, useContext } from "react";
import { cn } from "./utils";
const Ctx=createContext(null);
export function Select({value,onValueChange,children}){return <Ctx.Provider value={{value,onValueChange}}><div className="relative">{children}</div></Ctx.Provider>}
export function SelectTrigger({className,children,...p}){const c=useContext(Ctx); return <select value={c?.value ?? ""} onChange={e=>c?.onValueChange?.(e.target.value)} className={cn("h-10 rounded-md border border-input bg-background px-3 py-2 text-sm",className)} {...p}>{children}</select>}
export function SelectValue({placeholder}){return null}
export function SelectContent({children}){return <>{children}</>}
export function SelectItem({value,children}){return <option value={value}>{children}</option>}
