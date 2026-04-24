import type { ReactNode } from "react";

type CompareSectionProps = {
  title: string;
  description: string;
  leftTitle: string;
  rightTitle: string;
  leftEyebrow?: string;
  rightEyebrow?: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
};

export default function CompareSection({
  title,
  description,
  leftTitle,
  rightTitle,
  leftEyebrow = "Left analysis",
  rightEyebrow = "Right analysis",
  leftContent,
  rightContent,
}: CompareSectionProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(23,23,23,0.05)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm">
      <div className="border-b border-neutral-200 pb-4">
        <h3 className="text-xl font-semibold text-neutral-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-100 bg-neutral-50/70 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-sm">
          <div className="mb-4 h-1 w-14 rounded-full bg-emerald-700/80" />
          <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
            {leftEyebrow}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500">{leftTitle}</p>
          <div className="mt-4">{leftContent}</div>
        </div>

        <div className="rounded-md border border-neutral-100 bg-neutral-50/70 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-sm">
          <div className="mb-4 h-1 w-14 rounded-full bg-emerald-700/55" />
          <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
            {rightEyebrow}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500">{rightTitle}</p>
          <div className="mt-4">{rightContent}</div>
        </div>
      </div>
    </section>
  );
}
