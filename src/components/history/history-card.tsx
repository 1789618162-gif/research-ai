"use client";

import type { HistoryRecordSummary } from "../../../lib/history/types";

type HistoryCardProps = {
  record: HistoryRecordSummary;
  copied: boolean;
  onCopy: (record: HistoryRecordSummary) => void;
  onDelete: (id: string) => void;
  onView: (record: HistoryRecordSummary) => void;
};

const typeLabels = {
  competitor: "竞品分析",
  opportunity: "机会洞察",
} satisfies Record<HistoryRecordSummary["type"], string>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function HistoryCard({
  record,
  copied,
  onCopy,
  onDelete,
  onView,
}: HistoryCardProps) {
  return (
    <article className="min-w-0 rounded-md border border-neutral-200 bg-white/70 p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          {typeLabels[record.type]}
        </span>
        {record.isDemo ? (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            示例数据
          </span>
        ) : null}
        <span className="text-sm text-neutral-400">
          {formatDate(record.updatedAt)}
        </span>
      </div>

      <h2 className="mt-4 break-words text-2xl font-semibold leading-8 text-neutral-950">
        {record.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-500">
        分析目标：{record.target}
      </p>

      <div className="mt-5 grid grid-cols-2 divide-x divide-neutral-100 border-y border-neutral-100 py-4">
        <div>
          <p className="text-2xl font-semibold text-neutral-950">
            {record.competitorCount}
          </p>
          <p className="mt-1 text-sm text-neutral-500">竞品数量</p>
        </div>
        <div className="pl-5">
          <p className="text-2xl font-semibold text-neutral-950">
            {record.opportunityCount}
          </p>
          <p className="mt-1 text-sm text-neutral-500">机会点数量</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-neutral-700">{record.summary}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(record)}
          className="inline-flex h-10 items-center rounded-md bg-neutral-950 px-3 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800"
        >
          查看
        </button>
        <button
          type="button"
          onClick={() => onCopy(record)}
          className="inline-flex h-10 items-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950"
        >
          {copied ? "已复制" : "复制分析"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(record.id)}
          className="inline-flex h-10 items-center rounded-md border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-700 transition duration-200 ease-out hover:border-red-200 hover:bg-red-100"
        >
          删除
        </button>
      </div>
    </article>
  );
}
