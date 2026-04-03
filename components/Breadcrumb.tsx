"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ page }: { page: string }) {
  const router = useRouter();

  const items = [
    { name: "Home" },
    ...(page !== "Home" ? [{ name: page }] : []),
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex text-sm mb-6">
      <ol className="inline-flex items-center gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            )}
            {index === items.length - 1 ? (
              <span className="font-semibold text-slate-800" aria-current="page">
                {item.name}
              </span>
            ) : (
              <button
                onClick={() => router.back()}
                className="text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 transition-colors font-medium"
              >
                {item.name}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
