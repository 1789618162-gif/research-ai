import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-normal text-neutral-950">
          {title}
        </h2>
      </div>

      <div className="flex items-end gap-3 sm:justify-end">
        <p className="max-w-xl text-sm leading-6 text-neutral-500 sm:text-right">
          {description}
        </p>
        {action}
      </div>
    </div>
  );
}
