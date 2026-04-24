"use client";

import { reportTypes, type ReportTypeId } from "@/components/export/report-template";

type ReportTypeSelectorProps = {
  value: ReportTypeId;
  onChange: (value: ReportTypeId) => void;
};

export default function ReportTypeSelector({
  value,
  onChange,
}: ReportTypeSelectorProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
            Report type
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">
            报告类型选择
          </h2>
        </div>
        <p className="text-right text-sm leading-6 text-neutral-500">
          选择读者后，预览会调整章节重点。
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {reportTypes.map((type) => {
          const selected = value === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={`group rounded-md border p-4 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm ${
                selected
                  ? "border-emerald-700 bg-emerald-50/70"
                  : "border-neutral-200 bg-neutral-50/60"
              }`}
              aria-pressed={selected}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border ${
                        selected
                          ? "border-emerald-700 bg-emerald-700"
                          : "border-neutral-300 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`h-2 w-2 rounded-full bg-white transition ${
                          selected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </span>
                    <h3 className="text-lg font-semibold text-neutral-950">
                      {type.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {type.description}
                  </p>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    selected
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-neutral-500 ring-1 ring-neutral-200"
                  }`}
                >
                  {type.badge}
                </span>
              </div>

              <div className="mt-4 border-t border-neutral-200 pt-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-neutral-400">
                  Focus
                </p>
                <p className="mt-1 text-sm text-neutral-700">{type.focus}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
