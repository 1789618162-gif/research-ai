"use client";

import type { AnalysisDimensionKey } from "../../../lib/types/settings";
import { SettingRow, SettingsSection, SwitchControl } from "./settings-section";

type DimensionSettingsProps = {
  values: Record<AnalysisDimensionKey, boolean>;
  onChange: (key: AnalysisDimensionKey, value: boolean) => void;
};

const dimensions: Array<{
  key: AnalysisDimensionKey;
  label: string;
  description: string;
}> = [
  {
    key: "user",
    label: "用户维度",
    description: "识别目标用户、角色诉求与使用动机",
  },
  {
    key: "scenario",
    label: "场景维度",
    description: "分析高频任务、触发场景与上下文约束",
  },
  {
    key: "workflowDepth",
    label: "工作流深度",
    description: "评估任务链路、协作节点与流程复杂度",
  },
  {
    key: "automationLevel",
    label: "自动化程度",
    description: "判断可自动执行、需人工确认与可增强环节",
  },
  {
    key: "agentCapability",
    label: "Agent 能力",
    description: "关注规划、工具调用、记忆与多步推理需求",
  },
  {
    key: "businessModel",
    label: "商业化模式",
    description: "评估付费意愿、定价空间与交付路径",
  },
];

export default function DimensionSettings({
  values,
  onChange,
}: DimensionSettingsProps) {
  return (
    <SettingsSection
      id="dimensions"
      eyebrow="Analysis Dimensions"
      title="分析维度"
      description="控制 Agent 默认纳入分析的判断框架"
    >
      {dimensions.map((dimension) => (
        <SettingRow
          key={dimension.key}
          title={dimension.label}
          description={dimension.description}
          action={
            <SwitchControl
              checked={values[dimension.key]}
              label={dimension.label}
              onChange={(checked) => onChange(dimension.key, checked)}
            />
          }
        />
      ))}
    </SettingsSection>
  );
}
