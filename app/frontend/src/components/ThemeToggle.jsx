import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="theme-mode-toggle"
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-foreground"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
    </button>
  );
}
