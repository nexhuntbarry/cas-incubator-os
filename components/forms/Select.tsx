import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-soft-gray/70">{label}</label>
      <select
        className={`w-full px-3 py-2 bg-white/5 border ${
          error ? "border-status-error" : "border-white/10"
        } rounded-lg text-soft-gray focus:outline-none focus:border-electric-blue/60 transition-colors text-sm ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-deep-navy">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  );
}
