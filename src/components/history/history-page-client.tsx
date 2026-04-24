"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppTopNav from "@/components/AppTopNav";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import HistoryCard from "@/components/history/history-card";
import HistoryFilters, {
  type HistoryFilterValue,
  type HistorySortValue,
  type HistoryViewValue,
} from "@/components/history/history-filters";
import HistoryListRow from "@/components/history/history-list-row";
import HistoryTimelineItem from "@/components/history/history-timeline-item";
import {
  readStoredHistory,
  removeStoredHistoryRecord,
  toHistorySummaries,
} from "../../../lib/history/storage";
import type { HistoryRecordSummary } from "../../../lib/history/types";

type HistoryPageClientProps = {
  records: HistoryRecordSummary[];
};

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
const transitionMs = 650;

function isRecent(updatedAt: string) {
  return Date.now() - new Date(updatedAt).getTime() <= sevenDaysMs;
}

function matchesSearch(record: HistoryRecordSummary, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [record.title, record.query, record.target, record.summary].some(
    (value) => value.toLowerCase().includes(normalizedQuery),
  );
}

function matchesFilter(record: HistoryRecordSummary, filter: HistoryFilterValue) {
  if (filter === "recent") {
    return isRecent(record.updatedAt);
  }

  if (filter === "competitor" || filter === "opportunity") {
    return record.type === filter;
  }

  return true;
}

function sortRecords(records: HistoryRecordSummary[], sort: HistorySortValue) {
  return [...records].sort((a, b) => {
    if (sort === "opportunities") {
      return b.opportunityCount - a.opportunityCount;
    }

    if (sort === "competitors") {
      return b.competitorCount - a.competitorCount;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export default function HistoryPageClient({ records }: HistoryPageClientProps) {
  const router = useRouter();
  const [archiveRecords, setArchiveRecords] =
    useState<HistoryRecordSummary[]>(records);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilterValue>("all");
  const [sort, setSort] = useState<HistorySortValue>("updated");
  const [view, setView] = useState<HistoryViewValue>("cards");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionLabel, setTransitionLabel] = useState("Competition workspace");

  useEffect(() => {
    const storedRecords = toHistorySummaries(readStoredHistory());

    if (storedRecords.length > 0) {
      const frame = window.requestAnimationFrame(() => {
        setArchiveRecords(storedRecords);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }
  }, []);

  const visibleRecords = useMemo(() => {
    const filtered = archiveRecords.filter(
      (record) => matchesSearch(record, query) && matchesFilter(record, filter),
    );

    return sortRecords(filtered, sort);
  }, [archiveRecords, filter, query, sort]);

  function navigateWithTransition(
    href: string,
    label = "Competition workspace",
  ) {
    setTransitionLabel(label);
    setIsTransitioning(true);
    window.setTimeout(() => {
      router.push(href);
    }, transitionMs);
  }

  async function handleCopy(record: HistoryRecordSummary) {
    setCopiedId(record.id);

    try {
      await navigator.clipboard.writeText(record.query);
    } catch {
      // Clipboard may be unavailable in some embedded browsers.
    }

    window.setTimeout(() => {
      setCopiedId((current) => (current === record.id ? null : current));
    }, 1400);
  }

  function handleDelete(id: string) {
    const localRecords = readStoredHistory();

    if (localRecords.some((record) => record.id === id)) {
      const nextRecords = toHistorySummaries(removeStoredHistoryRecord(id));
      setArchiveRecords(nextRecords.length > 0 ? nextRecords : records);
      return;
    }

    setArchiveRecords((current) => current.filter((record) => record.id !== id));
  }

  const sharedViewProps = {
    onCopy: handleCopy,
    onDelete: handleDelete,
    onView: (record: HistoryRecordSummary) =>
      navigateWithTransition(record.resultHref, "Opening research result"),
  };

  function renderContent() {
    if (view === "list") {
      return (
        <section className="space-y-3 pb-12">
          {visibleRecords.map((record) => (
            <HistoryListRow
              key={record.id}
              record={record}
              copied={copiedId === record.id}
              {...sharedViewProps}
            />
          ))}
        </section>
      );
    }

    if (view === "timeline") {
      return (
        <section className="space-y-6 pb-12">
          {visibleRecords.map((record) => (
            <HistoryTimelineItem
              key={record.id}
              record={record}
              copied={copiedId === record.id}
              {...sharedViewProps}
            />
          ))}
        </section>
      );
    }

    return (
      <section className="grid gap-5 pb-12 lg:grid-cols-2">
        {visibleRecords.map((record) => (
          <HistoryCard
            key={record.id}
            record={record}
            copied={copiedId === record.id}
            {...sharedViewProps}
          />
        ))}
      </section>
    );
  }

  return (
    <>
      <PageTransitionOverlay visible={isTransitioning} label={transitionLabel} />

      <main className="min-h-screen bg-neutral-50 text-neutral-950">
        <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <header className="border-b border-neutral-200 pb-8">
            <AppTopNav
              current="history"
              actions={
                <button
                  type="button"
                  onClick={() =>
                    navigateWithTransition("/search", "Starting a new analysis")
                  }
                  className="inline-flex h-10 items-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800"
                >
                  新建分析
                </button>
              }
            />
            <div className="hidden">
              <button
                type="button"
                onClick={() =>
                  navigateWithTransition("/search", "Returning to search workspace")
                }
                className="inline-flex items-center gap-3 text-neutral-950"
                aria-label="返回 Research AI 搜索页"
              >
                <span className="grid h-8 w-8 place-items-center rounded-md bg-neutral-950 text-xs font-semibold text-white">
                  AI
                </span>
                <span className="text-sm font-semibold tracking-normal">
                  Research AI
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  navigateWithTransition("/search", "Starting a new analysis")
                }
                className="inline-flex h-10 items-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800"
              >
                新建分析
              </button>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                  Research Archive
                </p>
                <h1 className="mt-3 text-5xl font-semibold tracking-normal sm:text-6xl">
                  历史分析
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
                  查看、复用和管理过往研究结果。
                </p>
              </div>
              <div className="border-y border-neutral-200 py-4 text-sm text-neutral-500 lg:min-w-64">
                <span className="text-2xl font-semibold text-neutral-950">
                  {visibleRecords.length}
                </span>{" "}
                条当前记录
              </div>
            </div>
          </header>

          <div className="py-8">
            <HistoryFilters
              query={query}
              filter={filter}
              sort={sort}
              view={view}
              onQueryChange={setQuery}
              onFilterChange={setFilter}
              onSortChange={setSort}
              onViewChange={setView}
            />
          </div>

          {visibleRecords.length > 0 ? (
            renderContent()
          ) : (
            <section className="border-y border-neutral-200 bg-white/60 px-5 py-14 text-center">
              <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                Empty archive
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-neutral-950">
                暂无历史记录
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-600">
                当前筛选条件下没有可展示的分析记录。可以调整筛选条件，或新建一次竞品分析。
              </p>
              <button
                type="button"
                onClick={() =>
                  navigateWithTransition("/search", "Starting a new analysis")
                }
                className="mt-8 inline-flex h-11 items-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800"
              >
                新建分析
              </button>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
