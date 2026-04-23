import type { ReactNode } from "react";
import SectionHeader from "@/components/SectionHeader";

type CollapsibleSectionProps = {
  id?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function CollapsibleSection({
  id,
  title,
  eyebrow,
  description = "",
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className="group scroll-mt-24 border-y border-neutral-200 py-5"
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <SectionHeader
          eyebrow={eyebrow ?? "Details"}
          title={title}
          description={description}
          className="border-b-0 pb-0"
          action={
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition duration-200 ease-out group-hover:border-neutral-400 group-hover:text-neutral-950">
              <svg
                aria-hidden="true"
                className="h-4 w-4 transition duration-200 ease-out group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          }
        />
      </summary>
      <div className="pt-6">{children}</div>
    </details>
  );
}
