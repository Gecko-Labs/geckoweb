import { createContext, useContext, useState } from "react";
import { cn } from "./utils";

const Ctx = createContext(null);
export function AlertDialog({ children }) { const [open,setOpen]=useState(false); return <Ctx.Provider value={{open,setOpen}}>{children}</Ctx.Provider>; }
export function AlertDialogTrigger({ asChild, children, ...props }) { const {setOpen}=useContext(Ctx); return asChild ? <span onClick={()=>setOpen(true)}>{children}</span> : <button type="button" onClick={()=>setOpen(true)} {...props}>{children}</button>; }
export function AlertDialogContent({ className, children }) { const {open,setOpen}=useContext(Ctx); if(!open)return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={()=>setOpen(false)}><div className={cn("w-full max-w-lg rounded-lg border bg-background p-6 shadow-xl",className)} onMouseDown={e=>e.stopPropagation()}>{children}</div></div>; }
export function AlertDialogHeader({className,...p}){return <div className={cn("flex flex-col space-y-2 text-center sm:text-left",className)} {...p}/>}
export function AlertDialogFooter({className,...p}){return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",className)} {...p}/>}
export function AlertDialogTitle({className,...p}){return <h2 className={cn("text-lg font-semibold",className)} {...p}/>}
export function AlertDialogDescription({className,...p}){return <p className={cn("text-sm text-muted-foreground",className)} {...p}/>}
export function AlertDialogCancel({className,...p}){const {setOpen}=useContext(Ctx);return <button type="button" onClick={()=>setOpen(false)} className={cn("rounded-md border px-4 py-2 text-sm",className)} {...p}/>}
export function AlertDialogAction({className,...p}){const {setOpen}=useContext(Ctx);return <button type="button" onClick={()=>setOpen(false)} className={cn("rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",className)} {...p}/>}
