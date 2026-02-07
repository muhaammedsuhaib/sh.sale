import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TruncatedText } from "./TruncatedText";

interface SubHeaderProps {
  // Required
  title: string;

  // Optional
  description?: string;
  icon?: LucideIcon;
  iconBackground?: "blue" | "green" | "red" | "amber" | "violet" | "slate";
  badge?: {
    text: string;
    variant: "blue" | "green" | "red" | "amber" | "violet" | "slate";
    dot?: boolean;
  };
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const iconBackgroundClasses = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  violet:
    "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

const badgeClasses = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  green:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  violet:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  slate: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const badgeDotClasses = {
  blue: "bg-blue-600",
  green: "bg-emerald-600",
  red: "bg-red-600",
  amber: "bg-amber-600",
  violet: "bg-violet-600",
  slate: "bg-slate-600",
};

const SubHeader = ({
  title,
  description,
  icon: Icon,
  iconBackground = "blue",
  badge,
  actions,
  children,
  className = "",
}: SubHeaderProps) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Main Header Content */}
      <div className="flex items-start gap-4 mb-6">
        {/* Icon */}
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBackgroundClasses[iconBackground]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate"
                title={title}
              >
                {title}
              </h1>
              {description && (
                <TruncatedText
                  text={description}
                  maxLength={500}
                  className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base max-w-3xl"
                />
              )}
            </div>

            {/* Right Section - Badge and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {/* Badge */}
              {badge && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeClasses[badge.variant]}`}
                >
                  {badge.dot && (
                    <div
                      className={`w-2 h-2 rounded-full mr-1.5 ${badgeDotClasses[badge.variant]}`}
                    ></div>
                  )}
                  {badge.text}
                </span>
              )}

              {/* Actions */}
              {actions && (
                <div className="flex items-center gap-2">{actions}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children Content (Progress bars, tabs, etc.) */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default SubHeader;
