"use client";

import type { ReactNode } from "react";

type SettingsSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

type SettingRowProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
};

type SwitchControlProps = {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
};

export function SettingsSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-lg border border-neutral-200 bg-white"
    >
      <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-normal text-emerald-800">
          {eyebrow}
        </p>
        <div className="mt-2 grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)] sm:items-end">
          <h2 className="text-lg font-semibold tracking-normal text-neutral-950">
            {title}
          </h2>
          <p className="text-sm leading-6 text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </section>
  );
}

export function SettingRow({
  title,
  description,
  action,
  children,
}: SettingRowProps) {
  return (
    <div className="px-5 py-4 transition duration-200 ease-out hover:bg-neutral-50 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-950">{title}</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
            {description}
          </p>
        </div>
        {action ? <div className="sm:justify-self-end">{action}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function SwitchControl({
  checked,
  label,
  onChange,
}: SwitchControlProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-7 w-12 items-center rounded-full p-0.5 transition duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-neutral-100 ${
        checked ? "bg-emerald-700" : "bg-neutral-200 hover:bg-neutral-300"
      }`}
    >
      <span
        className={`h-6 w-6 rounded-full bg-white shadow-sm transition duration-200 ease-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function DisclosureIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 text-neutral-400 transition duration-200 ease-out ${
        expanded ? "rotate-180" : "rotate-0"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
