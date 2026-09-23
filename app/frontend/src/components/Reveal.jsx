import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export function RevealLines({ lines, className = "", lineClassName = "", delay = 0.15, stagger = 0.12 }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "112%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function FadeIn({ children, delay = 0, y = 26, className = "", ...props }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
