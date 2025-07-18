import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

/**
 * Render text content that might be markdown or plain text
 */
export const renderTextContent = (content: string | string[] | null) => {
  if (!content) return null;

  const textContent = typeof content === "string" ? content : "";

  if (textContent.includes("#") || textContent.includes("|")) {
    return <MarkdownRenderer content={textContent} />;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {textContent.split("\n").map((paragraph: string, index: number) =>
        paragraph.trim() ? (
          <p key={index} className="mb-2">
            {paragraph}
          </p>
        ) : (
          <br key={index} />
        )
      )}
    </div>
  );
};

/**
 * Get initials from full name
 */
export const getInitials = (fullName: string) => {
  return fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
};
