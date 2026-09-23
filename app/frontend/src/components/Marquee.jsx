export function Marquee({ items, className = "" }) {
  const content = [...items, ...items];
  return (
    <div
      className={`marquee-paused relative overflow-hidden border-y border-border/60 bg-secondary/40 py-3.5 ${className}`}
      aria-hidden="true"
    >
      <div className="animate-marquee flex w-max items-center whitespace-nowrap">
        {content.map((item, i) => (
          <span key={i} className="flex items-center font-mono text-xs tracking-[0.22em] text-muted-foreground">
            <span className="px-6">{item}</span>
            <span className="text-primary/70">//</span>
          </span>
        ))}
      </div>
    </div>
  );
}
