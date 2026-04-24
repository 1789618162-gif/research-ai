"use client";

import type { ReactNode } from "react";

export type HistoryFilterValue =
  | "all"
  | "recent"
  | "competitor"
  | "opportunity";
export type HistorySortValue = "updated" | "opportunities" | "competitors";
export type HistoryViewValue = "cards" | "list" | "timeline";

type HistoryFiltersProps = {
  query: string;
  filter: HistoryFilterValue;
  sort: HistorySortValue;
  view: HistoryViewValue;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: HistoryFilterValue) => void;
  onSortChange: (value: HistorySortValue) => void;
  onViewChange: (value: HistoryViewValue) => void;
};

const filters: Array<{ label: string; value: HistoryFilterValue }> = [
  { label: "全部", value: "all" },
  { label: "最近 7 天", value: "recent" },
  { label: "竞品分析", value: "competitor" },
  { label: "机会点洞察", value: "opportunity" },
];

const sortOptions: Array<{ label: string; value: HistorySortValue }> = [
  { label: "最近更新", value: "updated" },
  { label: "机会点数量", value: "opportunities" },
  { label: "竞品数量", value: "competitors" },
];

const viewOptions: Array<{
  value: HistoryViewValue;
  label: string;
  icon: ReactNode;
}> = [
  {
    value: "cards",
    label: "卡片视图",
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="3" y="13" width="7" height="7" rx="1.5" />
        <rect x="14" y="13" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    value: "list",
    label: "列表视图",
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    value: "timeline",
    label: "时间线视图",
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 5v14" />
        <circle cx="12" cy="5" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1.7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function HistoryFilters({
  query,
  filter,
  sort,
  view,
  onQueryChange,
  onFilterChange,
  onSortChange,
  onViewChange,
}: HistoryFiltersProps) {
  return (
    <section className="rounded-md border border-neutral-200 bg-white/70 p-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto] xl:items-center">
        <label className="min-w-0">
          <span className="sr-only">按赛道或产品名搜索</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="按赛道或产品名搜索"
            className="h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none transition duration-200 ease-out placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const isActive = item.value === filter;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterChange(item.value)}
                className={`h-10 rounded-md border px-3 text-sm font-medium transition duration-200 ease-out ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-950"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          className="inline-flex w-fit rounded-md border border-neutral-200 bg-white p-1"
          role="group"
          aria-label="历史记录视图切换"
        >
          {viewOptions.map((item) => {
            const isActive = item.value === view;

            return (
              <button
                key={item.value}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-pressed={isActive}
                onClick={() => onViewChange(item.value)}
                className={`grid h-9 w-9 place-items-center rounded-[6px] transition duration-200 ease-out ${
                  isActive
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                {item.icon}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-500">
          <span className="shrink-0">排序</span>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as HistorySortValue)
            }
            className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 outline-none transition duration-200 ease-out focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
          >
            {sortOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
