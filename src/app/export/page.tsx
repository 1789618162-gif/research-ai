"use client";

import ExportFormatActions from "@/components/export/export-format-actions";
import ExportOptions from "@/components/export/export-options";
import ReportPreview from "@/components/export/report-preview";
import ReportTypeSelector from "@/components/export/report-type-selector";
import {
  allReportSections,
  buildReportTemplateFromAnalysis,
  buildReportTemplate,
  defaultSelectedSections,
  type ReportSectionId,
  type ReportTypeId,
} from "@/components/export/report-template";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import { findStoredHistoryRecord } from "../../../lib/history/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode, useMemo, useState } from "react";

type WorkflowPanelProps = {
  index: string;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const transitionMs = 650;

function WorkflowPanel({
  index,
  title,
  description,
  open,
  onToggle,
  children,
}: WorkflowPanelProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white/70 shadow-[0_18px_55px_rgba(23,23,23,0.04)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-neutral-950 text-sm font-semibold text-white">
            {index}
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-semibold text-neutral-950">
              {title}
            </span>
            <span className="mt-1 block text-sm leading-6 text-neutral-500">
              {description}
            </span>
          </span>
        </span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-200 p-5">{children}</div>
        </div>
      </div>
    </section>
  );
}

function ExportPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceQuery = searchParams.get("q")?.trim() ?? "";
  const sourceHistoryId = searchParams.get("history")?.trim() ?? "";
  const [reportType, setReportType] = useState<ReportTypeId>("investor");
  const [selectedSections, setSelectedSections] = useState<ReportSectionId[]>(
    defaultSelectedSections,
  );
  const [openPanels, setOpenPanels] = useState({
    reportType: true,
    sections: true,
    preview: true,
    export: true,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sourceRecord = useMemo(
    () => (sourceHistoryId ? findStoredHistoryRecord(sourceHistoryId) : null),
    [sourceHistoryId],
  );

  const template = useMemo(
    () =>
      sourceRecord
        ? buildReportTemplateFromAnalysis(
            reportType,
            selectedSections,
            sourceQuery || sourceRecord.query,
            sourceRecord.analysis,
          )
        : buildReportTemplate(reportType, selectedSections),
    [reportType, selectedSections, sourceQuery, sourceRecord],
  );

  const sourceLabel = sourceRecord
    ? "来自分析结果"
    : sourceHistoryId
      ? "未找到历史记录，使用示例报告"
      : "示例报告";

  function togglePanel(panel: keyof typeof openPanels) {
    setOpenPanels((current) => ({
      ...current,
      [panel]: !current[panel],
    }));
  }

  function handleReportTypeChange(nextType: ReportTypeId) {
    setReportType(nextType);

    if (nextType === "full") {
      setSelectedSections(allReportSections);
    }
  }

  function handleToggleSection(sectionId: ReportSectionId) {
    setSelectedSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  }

  function navigateBackToResult() {
    setIsTransitioning(true);
    window.setTimeout(() => {
      if (sourceQuery) {
        const params = new URLSearchParams();
        params.set("q", sourceQuery);

        if (sourceHistoryId) {
          params.set("history", sourceHistoryId);
        }

        router.push(`/result?${params.toString()}`);
        return;
      }

      router.push("/search");
    }, transitionMs);
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <PageTransitionOverlay
        visible={isTransitioning}
        label={sourceQuery ? "Returning to analysis result" : "Returning to search"}
      />
      <section className="mx-auto w-full max-w-5xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="border-b border-neutral-200 pb-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={navigateBackToResult}
              disabled={isTransitioning}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition duration-200 ease-out hover:text-neutral-950 disabled:cursor-wait disabled:opacity-60"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              {sourceQuery ? "返回分析结果" : "返回搜索"}
            </button>
            <span className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600">
              {sourceLabel}
            </span>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_260px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
                Report export
              </p>
              <h1 className="mt-3 text-5xl font-semibold tracking-normal sm:text-6xl">
                导出报告
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
                {sourceRecord
                  ? `正在为「${sourceRecord.query}」生成面向不同读者的报告版本。`
                  : "先选择读者版本，再选择要包含的内容，最后导出为适合交付的文件。"}
              </p>
            </div>
            <div className="border-y border-neutral-200 py-4 text-sm leading-6 text-neutral-500 lg:border-l lg:border-y-0 lg:pl-6">
              <span className="block text-2xl font-semibold text-neutral-950">
                {template.sections.length}
              </span>
              个章节将写入当前报告
            </div>
          </div>
        </header>

        <section className="space-y-5 py-8">
          <WorkflowPanel
            index="01"
            title="报告类型选择"
            description="先确定读者是谁，让报告结构优先服务阅读目标。"
            open={openPanels.reportType}
            onToggle={() => togglePanel("reportType")}
          >
            <ReportTypeSelector
              value={reportType}
              onChange={handleReportTypeChange}
            />
          </WorkflowPanel>

          <WorkflowPanel
            index="02"
            title="内容选择器"
            description="按交付场景决定保留哪些分析模块。"
            open={openPanels.sections}
            onToggle={() => togglePanel("sections")}
          >
            <ExportOptions
              selectedSections={selectedSections}
              onToggle={handleToggleSection}
            />
          </WorkflowPanel>

          <WorkflowPanel
            index="03"
            title="报告预览"
            description="即时生成图片式预览，定位地图会显示为二维图像。"
            open={openPanels.preview}
            onToggle={() => togglePanel("preview")}
          >
            <ReportPreview template={template} />
          </WorkflowPanel>

          <WorkflowPanel
            index="04"
            title="下载格式与导出"
            description="确认预览后，选择 Markdown、PDF 或 PNG 导出。"
            open={openPanels.export}
            onToggle={() => togglePanel("export")}
          >
            <ExportFormatActions template={template} />
          </WorkflowPanel>
        </section>
      </section>
    </main>
  );
}

export default function ExportPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-950">
          <section className="mx-auto w-full max-w-5xl border-y border-neutral-200 py-10">
            <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
              Export workflow
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">
              正在准备导出报告
            </h1>
          </section>
        </main>
      }
    >
      <ExportPageClient />
    </Suspense>
  );
}
