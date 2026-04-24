"use client";

import { useState } from "react";
import type { ScoringWeightKey } from "../../../lib/types/settings";
import {
  DisclosureIcon,
  SettingRow,
  SettingsSection,
} from "./settings-section";

type ScoringSettingsProps = {
  values: Record<ScoringWeightKey, number>;
  onChange: (key: ScoringWeightKey, value: number) => void;
};

const weights: Array<{
  key: ScoringWeightKey;
  label: string;
  description: string;
}> = [
  {
    key: "userValue",
    label: "用户价值",
    description: "机会点能否解决明确、强烈、持续的用户问题",
  },
  {
    key: "differentiation",
    label: "差异化",
    description: "相对竞品的定位差异、壁垒与可被感知的优势",
  },
  {
    key: "feasibility",
    label: "可行性",
    description: "研发复杂度、数据条件、上线周期与组织投入",
  },
  {
    key: "agentFit",
    label: "Agent 适配度",
    description: "是否适合通过 Agent 的规划、执行与反馈闭环交付",
  },
];

function clampWeight(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export default function ScoringSettings({
  values,
  onChange,
}: ScoringSettingsProps) {
  const [expandedKey, setExpandedKey] = useState<ScoringWeightKey | null>(
    "userValue",
  );

  return (
    <SettingsSection
      id="scoring"
      eyebrow="Scoring Weights"
      title="机会点评分权重"
      description="展开单项后调整评分模型中的权重"
    >
      {weights.map((weight) => {
        const value = values[weight.key];
        const expanded = expandedKey === weight.key;

        return (
          <SettingRow
            key={weight.key}
            title={weight.label}
            description={weight.description}
            action={
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpandedKey(expanded ? null : weight.key)}
                className="inline-flex h-9 items-center gap-3 rounded-md px-2 text-sm font-semibold text-neutral-700 transition duration-200 ease-out hover:bg-neutral-100 hover:text-neutral-950"
              >
                <span>{value}%</span>
                <DisclosureIcon expanded={expanded} />
              </button>
            }
          >
            {expanded ? (
              <div className="grid gap-3 rounded-md bg-neutral-50 p-4 sm:grid-cols-[minmax(0,1fr)_104px] sm:items-center">
                <input
                  id={`weight-${weight.key}`}
                  value={value}
                  min={0}
                  max={100}
                  step={1}
                  type="range"
                  onChange={(event) =>
                    onChange(weight.key, clampWeight(event.target.valueAsNumber))
                  }
                  className="h-2 w-full cursor-pointer accent-emerald-700"
                />
                <label className="flex h-10 items-center rounded-md border border-neutral-200 bg-white px-2 focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-100">
                  <span className="sr-only">{weight.label} 数值</span>
                  <input
                    value={value}
                    min={0}
                    max={100}
                    type="number"
                    onChange={(event) =>
                      onChange(weight.key, clampWeight(event.target.valueAsNumber))
                    }
                    className="w-full bg-transparent text-right text-sm font-semibold text-neutral-950 outline-none"
                  />
                  <span className="ml-1 text-xs font-medium text-neutral-400">
                    %
                  </span>
                </label>
              </div>
            ) : null}
          </SettingRow>
        );
      })}
    </SettingsSection>
  );
}
