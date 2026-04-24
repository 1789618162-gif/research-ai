"use client";

import {
  createPrintableReportHtml,
  createReportFileName,
  reportTemplateToMarkdown,
  type ExportFormat,
  type ReportTemplate,
} from "@/components/export/report-template";
import { renderReportImageBlob } from "@/components/export/report-image-renderer";
import { useState } from "react";

type ExportFormatActionsProps = {
  template: ReportTemplate;
};

const exportFormats: Array<{
  id: ExportFormat;
  label: string;
  description: string;
}> = [
  {
    id: "markdown",
    label: "Markdown",
    description: "下载可继续编辑的 .md 文档。",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "打开打印窗口，保存为 PDF。",
  },
  {
    id: "png",
    label: "PNG 图片",
    description: "生成包含完整报告内容的长图。",
  },
];

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openPrintWindow(template: ReportTemplate) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error("浏览器阻止了打印窗口，请允许弹窗后重试。");
  }

  printWindow.document.open();
  printWindow.document.write(createPrintableReportHtml(template));
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 250);
}

async function downloadPng(template: ReportTemplate) {
  const blob = await renderReportImageBlob(template);
  downloadBlob(blob, createReportFileName(template, "png"));
}

export default function ExportFormatActions({
  template,
}: ExportFormatActionsProps) {
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [status, setStatus] = useState<"idle" | "exporting" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const currentFormatLabel =
    exportFormats.find((item) => item.id === format)?.label ?? "文件";

  async function handleExport() {
    setStatus("exporting");
    setMessage(null);

    try {
      if (format === "markdown") {
        const blob = new Blob([reportTemplateToMarkdown(template)], {
          type: "text/markdown;charset=utf-8",
        });
        downloadBlob(blob, createReportFileName(template, "md"));
      }

      if (format === "pdf") {
        openPrintWindow(template);
      }

      if (format === "png") {
        await downloadPng(template);
      }

      setStatus("done");
      setMessage("导出已准备完成。");
    } catch (error) {
      setStatus("idle");
      setMessage(error instanceof Error ? error.message : "导出失败，请稍后重试。");
      return;
    }

    window.setTimeout(() => {
      setStatus("idle");
      setMessage(null);
    }, 1600);
  }

  return (
    <section>
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
            Export format
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">
            下载格式与导出动作
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-neutral-500 sm:text-right">
          选择输出格式后生成真实前端文件。
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {exportFormats.map((item) => {
          const selected = format === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFormat(item.id)}
              className={`rounded-md border p-4 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white hover:shadow-sm ${
                selected
                  ? "border-emerald-700 bg-emerald-50/70"
                  : "border-neutral-200 bg-neutral-50/60"
              }`}
              aria-pressed={selected}
            >
              <span className="block text-base font-semibold text-neutral-950">
                {item.label}
              </span>
              <span className="mt-2 block text-sm leading-6 text-neutral-600">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-10 sm:flex-1">
          {message ? (
            <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-900">
              {message}
            </p>
          ) : (
            <p className="text-sm leading-6 text-neutral-500">
              当前将导出为 {currentFormatLabel}。
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={status === "exporting"}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-5 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-75 sm:ml-auto sm:w-auto"
        >
          {status === "exporting" ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
            />
          ) : null}
          {status === "exporting"
            ? "正在导出"
            : status === "done"
              ? "导出完成"
              : `导出 ${currentFormatLabel}`}
        </button>
      </div>
    </section>
  );
}
