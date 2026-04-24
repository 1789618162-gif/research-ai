"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AppTopNavProps = {
  current?: "search" | "history" | "settings" | "compare" | "result";
  actions?: ReactNode;
};

const navItems = [
  { key: "search", label: "搜索", href: "/search" },
  { key: "history", label: "历史记录", href: "/history" },
  { key: "settings", label: "Agent 设置", href: "/settings" },
] as const;

export default function AppTopNav({ current, actions }: AppTopNavProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/search"
        className="inline-flex w-fit items-center gap-3 text-neutral-950"
        aria-label="Research AI 首页"
      >
        <span className="grid h-8 w-8 place-items-center rounded-md bg-neutral-950 text-xs font-semibold text-white">
          AI
        </span>
        <span className="text-sm font-semibold tracking-normal">
          Research AI
        </span>
      </Link>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <nav
          aria-label="主要导航"
          className="flex flex-wrap items-center gap-1 rounded-md border border-neutral-200 bg-white p-1"
        >
          {navItems.map((item) => {
            const isActive = current === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-8 items-center rounded-[6px] px-3 text-sm font-medium transition duration-200 ease-out ${
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
