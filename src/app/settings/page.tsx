"use client";

import { useState } from "react";
import AppTopNav from "@/components/AppTopNav";
import DimensionSettings from "@/components/settings/dimension-settings";
import OutputSettings from "@/components/settings/output-settings";
import PromptSettings from "@/components/settings/prompt-settings";
import ScoringSettings from "@/components/settings/scoring-settings";
import {
  defaultAgentSettings,
  type AgentSettings,
  type AnalysisDimensionKey,
  type ScoringWeightKey,
} from "../../../lib/types/settings";

const navItems = [
  { href: "#dimensions", label: "分析维度" },
  { href: "#scoring", label: "评分权重" },
  { href: "#output", label: "输出偏好" },
  { href: "#prompt", label: "Prompt 策略" },
];

function cloneDefaultSettings(): AgentSettings {
  return {
    dimensions: { ...defaultAgentSettings.dimensions },
    scoringWeights: { ...defaultAgentSettings.scoringWeights },
    output: { ...defaultAgentSettings.output },
    prompt: defaultAgentSettings.prompt,
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AgentSettings>(cloneDefaultSettings);
  const [saveMessage, setSaveMessage] = useState("尚未保存本次调整");

  function markEdited(nextSettings: AgentSettings) {
    setSettings(nextSettings);
    setSaveMessage("有未保存的本地调整");
  }

  function updateDimension(key: AnalysisDimensionKey, value: boolean) {
    markEdited({
      ...settings,
      dimensions: {
        ...settings.dimensions,
        [key]: value,
      },
    });
  }

  function updateScoringWeight(key: ScoringWeightKey, value: number) {
    markEdited({
      ...settings,
      scoringWeights: {
        ...settings.scoringWeights,
        [key]: value,
      },
    });
  }

  function handleSave() {
    setSaveMessage("设置已保存到当前页面状态");
  }

  function handleReset() {
    setSettings(cloneDefaultSettings());
    setSaveMessage("已恢复默认设置");
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-6">
          <AppTopNav current="settings" />

          <p className="mt-8 text-sm font-medium uppercase tracking-normal text-emerald-800">
            Agent Configuration
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-neutral-950 sm:text-4xl">
                分析 Agent 设置
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                配置分析维度、评分权重与输出偏好。
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm">
              <span className="block text-xs font-semibold uppercase tracking-normal text-neutral-400">
                Local State
              </span>
              <span className="mt-1 block font-medium text-neutral-700">
                {saveMessage}
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <nav
              aria-label="设置分类"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition duration-200 ease-out hover:bg-white hover:text-neutral-950 lg:block"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-5">
            <DimensionSettings
              values={settings.dimensions}
              onChange={updateDimension}
            />
            <ScoringSettings
              values={settings.scoringWeights}
              onChange={updateScoringWeight}
            />
            <OutputSettings
              value={settings.output}
              onChange={(output) =>
                markEdited({
                  ...settings,
                  output,
                })
              }
            />
            <PromptSettings
              value={settings.prompt}
              onChange={(prompt) =>
                markEdited({
                  ...settings,
                  prompt,
                })
              }
            />
          </div>
        </div>

        <footer className="sticky bottom-0 -mx-4 border-t border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">{saveMessage}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:border-neutral-400 hover:text-neutral-950"
              >
                恢复默认设置
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-950 px-5 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-emerald-800"
              >
                保存设置
              </button>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
