import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center mx-auto">
          <SearchX size={28} className="text-electric-blue" />
        </div>
        <div>
          <p className="text-6xl font-black text-electric-blue/20 mb-2">404</p>
          <h1 className="text-2xl font-bold text-soft-gray mb-2">Page not found</h1>
          <p className="text-soft-gray/60 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-blue text-white text-sm font-semibold hover:bg-electric-blue/90 transition-colors min-h-[44px]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
