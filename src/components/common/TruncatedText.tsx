import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showToggle?: boolean;
  lines?: number;
  expandLabel?: string;
  collapseLabel?: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 100,
  className = "",
  showToggle = true,
  lines,
  expandLabel = "Show More",
  collapseLabel = "Show Less",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || typeof text !== "string") return null;

  // Calculate display text based on maxLength
  const shouldTruncateByLength = text.length > maxLength;

  // Calculate display text based on lines (if provided)
  const shouldTruncateByLines =
    lines && (text.split("\n").length > lines || text.length > 500);
  const shouldTruncate = shouldTruncateByLength || shouldTruncateByLines;

  let displayText = text;
  if (shouldTruncate && !isExpanded) {
    if (maxLength) {
      displayText = `${text.substring(0, maxLength)}...`;
    } else if (lines) {
      const linesArray = text.split("\n");
      displayText = linesArray.slice(0, lines).join("\n") + "...";
    }
  }

  return (
    <div className={className}>
      <div
        className={`whitespace-pre-line wrap-break-word ${!isExpanded && lines ? "line-clamp-" + lines : ""}`}
        style={
          lines && !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: lines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}
        }
        title={text}
      >
        {displayText}
      </div>
      {shouldTruncate && showToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors duration-200"
          aria-label={isExpanded ? collapseLabel : expandLabel}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {collapseLabel}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {expandLabel}
            </>
          )}
        </button>
      )}
    </div>
  );
};
