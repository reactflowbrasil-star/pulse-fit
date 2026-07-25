import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "gradient";
  hover?: boolean;
}

const cardVariants: Record<string, string> = {
  default:
    "rounded-2xl bg-surface-card border border-border shadow-card",
  elevated:
    "rounded-2xl bg-surface-card border border-border shadow-elevated",
  glass:
    "rounded-2xl glass",
  gradient:
    "rounded-2xl bg-gradient-to-br from-primary/10 via-surface-card to-surface-card border border-primary/10 shadow-card",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hover = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${cardVariants[variant]} ${
          hover ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-5 pt-5 pb-2 ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`font-display text-lg font-semibold ${className}`}>{children}</h3>;
}
