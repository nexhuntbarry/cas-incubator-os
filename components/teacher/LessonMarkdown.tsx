'use client';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function LessonMarkdown({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-electric-blue mb-2 mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold text-vivid-teal mt-6 mb-2 pb-1 border-b border-white/8">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-soft-gray mt-4 mb-1.5 uppercase tracking-wider">{children}</h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-electric-blue/60 pl-4 italic text-soft-gray/60 my-3 text-sm">{children}</blockquote>
        ),
        p: ({ children }) => (
          <p className="text-soft-gray/80 leading-relaxed mb-3 text-sm">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-soft-gray/80 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-soft-gray/80 text-sm">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed pl-1">{children}</li>
        ),
        code: ({ children }) => (
          <code className="bg-deep-navy/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-vivid-teal">{children}</code>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-electric-blue underline hover:text-electric-blue/80" target="_blank" rel="noopener noreferrer">{children}</a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
