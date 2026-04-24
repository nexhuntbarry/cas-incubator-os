import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-soft-gray/70">{label}</label>
      <input
        className={`w-full px-3 py-2 bg-white/5 border ${
          error ? "border-status-error" : "border-white/10"
        } rounded-lg text-soft-gray placeholder-soft-gray/30 focus:outline-none focus:border-electric-blue/60 transition-colors text-sm ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  );
}
