"use client";

import { renderReportImageDataUrl } from "@/components/export/report-image-renderer";
import type { ReportTemplate } from "@/components/export/report-template";
import { useEffect, useState } from "react";

type ReportPreviewProps = {
  template: ReportTemplate;
};

export default function ReportPreview({ template }: ReportPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;

    const frame = window.requestAnimationFrame(() => {
      try {
        const nextPreviewUrl = renderReportImageDataUrl(template);

        if (active) {
          setPreviewUrl(nextPreviewUrl);
        }
      } catch {
        if (active) {
          setPreviewUrl(null);
        }
      }
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
  }, [template]);

  return (
    <section>
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-emerald-800">
            Live image preview
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">
            报告预览
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-neutral-500 sm:text-right">
          预览与 PNG 导出使用同一张完整报告长图。
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 p-3">
        {previewUrl ? (
          <div className="relative max-h-[420px] overflow-hidden rounded-sm border border-neutral-200 bg-white">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex h-9 items-center rounded-md bg-neutral-950 px-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(23,23,23,0.14)] transition duration-200 ease-out hover:bg-emerald-800"
              >
                放大预览
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`${template.title} 图片预览`}
              className="block h-auto w-full bg-white"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-white/0" />
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-sm border border-dashed border-neutral-300 bg-white text-center">
            <div>
              <p className="text-sm font-medium text-neutral-700">
                正在生成报告图片
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                勾选内容模块后，预览会即时刷新。
              </p>
            </div>
          </div>
        )}
      </div>

      {expanded && previewUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="放大报告预览"
          className="fixed inset-0 z-[60] bg-neutral-950/70 px-4 py-5 backdrop-blur-sm sm:px-6"
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col rounded-lg bg-neutral-50 shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-emerald-800">
                  Full preview
                </p>
                <h3 className="mt-1 text-lg font-semibold text-neutral-950">
                  {template.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex h-9 items-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950"
              >
                关闭
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-neutral-100 p-3 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`${template.title} 放大预览`}
                className="mx-auto block h-auto w-full max-w-5xl rounded-sm border border-neutral-200 bg-white"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
