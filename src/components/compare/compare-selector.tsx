"use client";

import type { CompareAnalysis } from "@/components/compare/mock-analyses";

type CompareSelectorProps = {
  label: string;
  side: "left" | "right";
  value: string;
  analyses: CompareAnalysis[];
  onChange: (value: string) => void;
};

export default function CompareSelector({
  label,
  side,
  value,
  analyses,
  onChange,
}: CompareSelectorProps) {
  const selected =
    analyses.find((analysis) => analysis.id === value) ?? analyses[0];
  const sideLabel = side === "left" ? "Analysis A" : "Analysis B";
  const sourceLabel = selected?.source === "live" ? "当前分析" : "Mock 基准";

  return (
    <section className="rounded-lg border border-neutral-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(23,23,23,0.05)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-neutral-400">
            {sideLabel}
          </p>
        </div>
        <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
          {sourceLabel}
        </span>
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 h-12 w-full rounded-md border border-neutral-200 bg-white px-4 text-base text-neutral-950 outline-none transition duration-200 ease-out focus:border-neutral-400"
      >
        {analyses.map((analysis) => (
          <option key={analysis.id} value={analysis.id}>
            {analysis.source === "live"
              ? `${analysis.title}（当前分析）`
              : analysis.title}
          </option>
        ))}
      </select>

      <p className="mt-4 text-sm leading-6 text-neutral-600">
        {selected.summary}
      </p>
    </section>
  );
}
