import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-text-tertiary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-2xl bg-surface-elevated px-4 py-3 text-sm text-foreground
            placeholder:text-text-muted
            border border-border
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50
            hover:border-border
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? "border-destructive/50 focus:ring-destructive/40" : ""}
            ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
