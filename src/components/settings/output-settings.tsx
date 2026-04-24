"use client";

import type { OutputFormat } from "../../../lib/types/settings";
import { SettingRow, SettingsSection, SwitchControl } from "./settings-section";

type OutputSettingsValue = {
  format: OutputFormat;
  competitorCount: number;
  generatePriority: boolean;
  showExecutionLogs: boolean;
};

type OutputSettingsProps = {
  value: OutputSettingsValue;
  onChange: (value: OutputSettingsValue) => void;
};

const formats: Array<{ label: string; value: OutputFormat }> = [
  { label: "简版", value: "brief" },
  { label: "完整版", value: "full" },
];

function clampCompetitorCount(value: number) {
  if (Number.isNaN(value)) {
    return 1;
  }

  return Math.min(20, Math.max(1, value));
}

export default function OutputSettings({ value, onChange }: OutputSettingsProps) {
  return (
    <SettingsSection
      id="output"
      eyebrow="Output Preference"
      title="输出偏好"
      description="设置默认报告形态与分析输出细节"
    >
      <SettingRow
        title="默认输出格式"
        description="选择生成更适合快速浏览或完整汇报的结果"
        action={
          <div
            className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 p-1"
            role="group"
            aria-label="默认输出格式"
          >
            {formats.map((format) => {
              const active = value.format === format.value;

              return (
                <button
                  key={format.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...value, format: format.value })}
                  className={`h-8 rounded-[6px] px-3 text-sm font-semibold transition duration-200 ease-out ${
                    active
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  {format.label}
                </button>
              );
            })}
          </div>
        }
      />

      <SettingRow
        title="默认竞品数量"
        description="自定义每次分析默认拉取和比较的竞品数量"
        action={
          <label className="flex h-10 w-28 items-center rounded-md border border-neutral-200 bg-white px-3 focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-100">
            <span className="sr-only">默认竞品数量</span>
            <input
              value={value.competitorCount}
              min={1}
              max={20}
              type="number"
              onChange={(event) =>
                onChange({
                  ...value,
                  competitorCount: clampCompetitorCount(
                    event.target.valueAsNumber,
                  ),
                })
              }
              className="w-full bg-transparent text-right text-sm font-semibold text-neutral-950 outline-none"
            />
            <span className="ml-2 text-xs font-medium text-neutral-400">个</span>
          </label>
        }
      />

      <SettingRow
        title="默认生成机会点优先级"
        description="在输出中自动给机会点排序，便于后续决策"
        action={
          <SwitchControl
            checked={value.generatePriority}
            label="默认生成机会点优先级"
            onChange={(generatePriority) =>
              onChange({ ...value, generatePriority })
            }
          />
        }
      />

      <SettingRow
        title="显示执行日志"
        description="展示 Agent 分析过程中的关键步骤与中间状态"
        action={
          <SwitchControl
            checked={value.showExecutionLogs}
            label="显示执行日志"
            onChange={(showExecutionLogs) =>
              onChange({ ...value, showExecutionLogs })
            }
          />
        }
      />
    </SettingsSection>
  );
}
