"use client";

import { useState } from "react";
import {
  DisclosureIcon,
  SettingRow,
  SettingsSection,
} from "./settings-section";

type PromptSettingsProps = {
  value: string;
  onChange: (value: string) => void;
};

const defaultPromptPlaceholder =
  "你是一个专业的产品机会分析 Agent。请基于用户、场景、工作流、自动化程度、Agent 能力与商业化模式评估机会点，并输出可执行的评分与优先级建议。";

export default function PromptSettings({ value, onChange }: PromptSettingsProps) {
  const [expanded, setExpanded] = useState(false);
  const promptState = value.trim() ? "已自定义" : "使用默认";

  return (
    <SettingsSection
      id="prompt"
      eyebrow="Prompt Strategy"
      title="Prompt 策略"
      description="高级用户可微调 Agent 的分析方式"
    >
      <SettingRow
        title="系统提示词"
        description="留空时使用默认系统提示词；展开后可覆写分析策略"
        action={
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex h-9 items-center gap-3 rounded-md px-2 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:bg-neutral-100 hover:text-neutral-950"
          >
            <span>{promptState}</span>
            <DisclosureIcon expanded={expanded} />
          </button>
        }
      >
        {expanded ? (
          <div className="rounded-md bg-neutral-50 p-4">
            <label className="block">
              <span className="sr-only">系统提示词</span>
              <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={defaultPromptPlaceholder}
                rows={7}
                className="min-h-44 w-full resize-y rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition duration-200 ease-out placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
              />
            </label>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              高级用户可微调分析策略。留空时使用系统默认提示词。
            </p>
          </div>
        ) : null}
      </SettingRow>
    </SettingsSection>
  );
}
