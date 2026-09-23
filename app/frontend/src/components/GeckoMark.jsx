import { useTheme } from "../context/ThemeContext";

export function GeckoMark({ className = "", ...props }) {
  const { theme } = useTheme();
  const src =
    theme === "dark"
      ? "/assets/branding/gecko-mark.png"
      : "/assets/branding/gecko-mark-white.jpeg";
  return (
    <img
      src={src}
      alt="Emblema geométrico GeckoLabs"
      className={className}
      draggable={false}
      {...props}
    />
  );
}
