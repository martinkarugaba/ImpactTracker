"use client";

import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mt-6 mb-2 text-xl font-bold" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-4 mb-2 text-lg font-bold" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-md mt-3 mb-2 font-bold" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="mb-3 list-disc pl-6" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="mb-3 list-decimal pl-6" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          table: ({ node, ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table
                className="min-w-full divide-y divide-gray-300 border border-gray-300 dark:divide-gray-700 dark:border-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody
              className="divide-y divide-gray-200 dark:divide-gray-800"
              {...props}
            />
          ),
          tr: ({ node, ...props }) => <tr {...props} />,
          th: ({ node, ...props }) => (
            <th
              className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 text-sm" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-500 hover:text-blue-600 hover:underline"
              {...props}
            />
          ),
          code: ({ node, ...props }) => {
            // @ts-expect-error - inline is provided by react-markdown
            const isInline = props.inline;
            return isInline ? (
              <code
                className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800"
                {...props}
              />
            ) : (
              <code
                className="block overflow-x-auto rounded bg-gray-100 p-2 dark:bg-gray-800"
                {...props}
              />
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-4 border-l-4 border-gray-300 pl-4 italic dark:border-gray-700"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              className="my-6 border-t border-gray-300 dark:border-gray-700"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
