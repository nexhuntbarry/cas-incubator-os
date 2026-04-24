'use client';

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-soft-gray mb-2">Something went wrong</h1>
          <p className="text-soft-gray/60 text-sm leading-relaxed">
            An unexpected error occurred. Our team has been notified.
            {error.digest && (
              <span className="block mt-2 font-mono text-xs text-soft-gray/30">
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors min-h-[44px]"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-soft-gray/70 text-sm hover:text-soft-gray hover:border-white/20 transition-colors min-h-[44px]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
