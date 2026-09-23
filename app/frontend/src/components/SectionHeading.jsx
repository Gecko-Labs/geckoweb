import { FadeIn } from "./Reveal";

export function SectionHeading({ chapter, title, description, align = "left" }) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <FadeIn className={`flex flex-col gap-3 ${alignClass}`}>
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary/90" data-testid={`chapter-label-${chapter}`}>
        {chapter}
      </span>
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className={`max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </FadeIn>
  );
}
