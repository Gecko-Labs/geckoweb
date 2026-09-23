import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
} from "react";

import { cn } from "./utils";

const SelectContext = createContext(null);

function collectItems(children, result = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === SelectItem) {
      result.push({
        value: child.props.value,
        label: child.props.children,
      });
      return;
    }

    if (child.props?.children) {
      collectItems(child.props.children, result);
    }
  });

  return result;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
  disabled = false,
}) {
  const items = useMemo(
    () => collectItems(children),
    [children],
  );

  const currentValue = value ?? defaultValue ?? "";

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange,
        items,
        disabled,
      }}
    >
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
  disabled,
  ...props
}) {
  const context = useContext(SelectContext);

  const placeholder =
    Children.toArray(children).find(
      (child) =>
        isValidElement(child) && child.type === SelectValue,
    )?.props?.placeholder;

  return (
    <select
      value={context?.value ?? ""}
      onChange={(event) =>
        context?.onValueChange?.(event.target.value)
      }
      disabled={disabled ?? context?.disabled}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        "text-foreground outline-none transition-colors",
        "focus:border-primary focus:ring-1 focus:ring-primary/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-label={placeholder}
      {...props}
    >
      {placeholder &&
        !context?.items?.some(
          (item) => item.value === context?.value,
        ) && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

      {context?.items?.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export function SelectValue({ placeholder }) {
  return null;
}

export function SelectContent({ children }) {
  return <div className="hidden">{children}</div>;
}

export function SelectItem({ value, children }) {
  return (
    <option value={value}>
      {children}
    </option>
  );
}