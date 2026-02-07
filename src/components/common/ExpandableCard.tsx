import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  onToggle?: (isExpanded: boolean) => void;
  showBorder?: boolean;
  variant?: "default" | "compact" | "ghost";
  disabled?: boolean;
  lazyLoad?: boolean;
  animationDuration?: number;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  children,
  defaultExpanded = false,
  className = "",
  contentClassName = "",
  titleClassName = "",
  icon: Icon,
  iconClassName = "",
  onToggle,
  showBorder = true,
  variant = "default",
  disabled = false,
  lazyLoad = false,
  animationDuration = 200,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasBeenOpened, setHasBeenOpened] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (lazyLoad && isExpanded && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  }, [lazyLoad, isExpanded, hasBeenOpened]);

  const handleToggle = () => {
    if (disabled) return;

    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    if (lazyLoad && newExpanded) {
      setHasBeenOpened(true);
    }

    onToggle?.(newExpanded);
  };

  // Variant styles
  const variantStyles = {
    default: "bg-slate-50 dark:bg-slate-800/50",
    compact: "bg-transparent",
    ghost: "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30",
  };

  const paddingStyles = {
    default: "p-4",
    compact: "p-3",
    ghost: "p-4",
  };

  const contentPaddingStyles = {
    default: "px-4 pb-4 pt-2",
    compact: "px-3 pb-3 pt-1",
    ghost: "px-4 pb-4 pt-2",
  };

  // Calculate if we should render children
  const shouldRenderChildren = !lazyLoad || hasBeenOpened;

  return (
    <div
      className={`
        ${variantStyles[variant]} 
        ${showBorder ? "border border-slate-200 dark:border-slate-700" : ""}
        rounded-xl
        transition-all duration-${animationDuration}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* Header/Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between 
          ${paddingStyles[variant]} 
          text-left
          ${!disabled ? "hover:bg-slate-100 dark:hover:bg-slate-800/70" : ""}
          rounded-xl
          transition-colors duration-${animationDuration}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {/* Left side: Icon + Title */}
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              className={`h-4 w-4 ${iconClassName || "text-slate-500 dark:text-slate-400"}`}
              aria-hidden="true"
            />
          )}
          <h3
            className={`
              text-sm font-medium 
              ${titleClassName || "text-slate-700 dark:text-slate-300"}
              ${disabled ? "text-slate-400 dark:text-slate-500" : ""}
            `}
          >
            {title}
          </h3>
        </div>

        {/* Right side: Chevron Icon */}
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp
              className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200"
              aria-hidden="true"
            />
          )}
        </div>
      </button>

      {/* Content Area */}
      <div
        id={`expandable-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className={`
          overflow-hidden
          transition-all duration-${animationDuration}
          ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        `}
        style={{
          transitionDuration: `${animationDuration}ms`,
        }}
      >
        {isExpanded && (
          <div
            className={`
              ${contentPaddingStyles[variant]}
              ${showBorder ? "border-t border-slate-200 dark:border-slate-700" : ""}
              ${contentClassName}
            `}
            ref={(el) => {
              if (el && contentHeight === "auto") {
                setContentHeight(el.scrollHeight);
              }
            }}
          >
            {shouldRenderChildren ? children : null}
          </div>
        )}
      </div>
    </div>
  );
};

ExpandableCard.displayName = "ExpandableCard";

// Optional: Create a compound component for common use cases
export const ExpandableCardCompound = {
  Section: ExpandableCard,
  createWithIcon: (Icon: React.ElementType) => {
    return (props: Omit<ExpandableCardProps, "icon">) => (
      <ExpandableCard {...props} icon={Icon} />
    );
  },
};
