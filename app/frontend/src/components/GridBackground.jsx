export function GridBackground({ className = "" }) {
  return (
    <div aria-hidden="true" className={`blueprint-grid pointer-events-none absolute inset-0 ${className}`} />
  );
}
