"use client";

import {
  reportSectionOptions,
  type ReportSectionId,
} from "@/components/export/report-template";

type ExportOptionsProps = {
  selectedSections: ReportSectionId[];
  onToggle: (sectionId: ReportSectionId) => void;
};

export default function ExportOptions({
  selectedSections,
  onToggle,
}: ExportOptionsProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
            Included sections
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">
            内容选择器
          </h2>
        </div>
        <p className="text-right text-sm leading-6 text-neutral-500">
          已选择 {selectedSections.length} 个模块
        </p>
      </div>

      <div className="mt-5 divide-y divide-neutral-100">
        {reportSectionOptions.map((section) => {
          const checked = selectedSections.includes(section.id);

          return (
            <label
              key={section.id}
              className="flex cursor-pointer gap-4 py-4 first:pt-0 last:pb-0"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(section.id)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 accent-emerald-700"
              />
              <span>
                <span className="block font-medium text-neutral-950">
                  {section.label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-neutral-500">
                  {section.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
