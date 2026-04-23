"use client";

import SectionHeader from "@/components/SectionHeader";
import { useEffect, useState } from "react";

export type AgentProgressStatus = "loading" | "complete";

type AgentProgressProps = {
  status: AgentProgressStatus;
  onDone?: () => void;
};

const steps = [
  "识别赛道",
  "抽取竞品",
  "对比能力",
  "评分机会",
  "生成建议",
];

const STEP_INTERVAL_MS = 700;
const COMPLETE_DELAY_MS = 900;

export default function AgentProgress({ status, onDone }: AgentProgressProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const visibleActiveStep = status === "complete" ? steps.length : activeStep;

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, STEP_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "complete") {
      return;
    }

    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, COMPLETE_DELAY_MS);

    const doneTimer = window.setTimeout(() => {
      onDone?.();
    }, COMPLETE_DELAY_MS + 300);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone, status]);

  return (
    <section
      id="agent-progress"
      className={`scroll-mt-24 transition duration-300 ease-out ${
        isLeaving ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <SectionHeader
        eyebrow="Agent Progress"
        title="分析进度"
        description={
          status === "loading" ? "正在执行多步骤研究" : "研究步骤已完成"
        }
      />

      <div className="mt-6 border-y border-neutral-200 bg-white/50 py-5">
        <div className="grid gap-2 sm:grid-cols-5">
          {steps.map((step, index) => {
            const isComplete = status === "complete" || index < visibleActiveStep;
            const isActive = status === "loading" && index === visibleActiveStep;
            const stateLabel = isComplete
              ? "已完成"
              : isActive
                ? "进行中"
                : "等待中";
            const stateClass = isComplete
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : isActive
                ? "border-emerald-300 bg-white text-emerald-900 shadow-sm"
                : "border-neutral-200 bg-neutral-50 text-neutral-500";

            return (
              <div
                key={step}
                className={`relative overflow-hidden rounded-md border px-3 py-3 transition duration-300 ease-out ${stateClass}`}
              >
                {isActive ? (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-emerald-100">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-500" />
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold ${
                      isActive ? "animate-pulse" : ""
                    }`}
                  >
                    {isComplete ? "✓" : index + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </div>
                <p className="mt-2 text-xs text-current/70">{stateLabel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
