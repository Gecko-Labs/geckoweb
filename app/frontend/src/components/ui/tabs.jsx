import { createContext, useContext, useState } from "react";
import { cn } from "./utils";

const TabsContext = createContext(null);
export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const change = (v) => { setInternal(v); onValueChange?.(v); };
  return <TabsContext.Provider value={{ value: current, setValue: change }}><div className={cn(className)} {...props}>{children}</div></TabsContext.Provider>;
}
export function TabsList({ className, ...props }) { return <div role="tablist" className={cn("inline-flex items-center justify-center rounded-md bg-muted p-1", className)} {...props} />; }
export function TabsTrigger({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext); const active = ctx?.value === value;
  return <button type="button" role="tab" aria-selected={active} onClick={() => ctx?.setValue(value)} className={cn("rounded-sm px-3 py-1.5 text-sm transition-colors", active && "bg-background text-foreground shadow-sm", className)} {...props}>{children}</button>;
}
export function TabsContent({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext); if (ctx?.value !== value) return null;
  return <div role="tabpanel" className={cn("mt-2", className)} {...props}>{children}</div>;
}
