"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { label: "Tous", value: "" },
  { label: "Actifs", value: "active" },
  { label: "Brouillons", value: "draft" },
  { label: "Complétés", value: "completed" },
] as const;

export default function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  function handleTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`/dashboard/protocols?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTab(tab.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px] ${
            current === tab.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
