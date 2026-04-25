import { readFileSync } from "fs";
import { join } from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CAS Incubator OS",
};

export default function TermsPage() {
  const content = readFileSync(
    join(process.cwd(), "docs/LEGAL/terms.md"),
    "utf-8"
  );

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-soft-gray/50 hover:text-soft-gray mb-10 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <article className="prose prose-invert prose-sm max-w-none prose-headings:text-soft-gray prose-p:text-soft-gray/80 prose-li:text-soft-gray/80 prose-a:text-electric-blue prose-strong:text-soft-gray prose-table:text-soft-gray/80 prose-th:text-soft-gray prose-hr:border-white/10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
