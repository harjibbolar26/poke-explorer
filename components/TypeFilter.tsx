"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getTypes } from "@/lib/api";

interface TypeFilterProps {
  initialType?: string;
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-200 hover:bg-gray-300",
  fire: "bg-red-100 hover:bg-red-200",
  water: "bg-blue-100 hover:bg-blue-200",
  electric: "bg-yellow-100 hover:bg-yellow-200",
  grass: "bg-green-100 hover:bg-green-200",
  ice: "bg-cyan-100 hover:bg-cyan-200",
  fighting: "bg-orange-100 hover:bg-orange-200",
  poison: "bg-purple-100 hover:bg-purple-200",
  ground: "bg-amber-100 hover:bg-amber-200",
  flying: "bg-indigo-100 hover:bg-indigo-200",
  psychic: "bg-pink-100 hover:bg-pink-200",
  bug: "bg-lime-100 hover:bg-lime-200",
  rock: "bg-amber-700 hover:bg-amber-800",
  ghost: "bg-purple-500 hover:bg-purple-600",
  dragon: "bg-indigo-600 hover:bg-indigo-700",
  steel: "bg-slate-200 hover:bg-slate-300",
  fairy: "bg-pink-200 hover:bg-pink-300",
};

export default function TypeFilter({ initialType = "" }: TypeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [types, setTypes] = useState<string[]>([]);
  const selectedType = searchParams.get("type") || "";

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const fetchedTypes = await getTypes();
        setTypes(fetchedTypes);
      } catch (err) {
        console.error("Failed to fetch types:", err);
      }
    };
    fetchTypes();
  }, []);

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Type Filter
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleTypeChange("")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedType === ""
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors ${
              selectedType === type
                ? "bg-indigo-600 text-white"
                : `${TYPE_COLORS[type] || "bg-slate-100"} text-slate-700 hover:opacity-90`
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
