"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [inputValue, setInputValue] = useState(urlSearch);
  const isSelfUpdate = useRef(false);

  useEffect(() => {
    if (isSelfUpdate.current) {
      isSelfUpdate.current = false;
      return;
    }
    setInputValue(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (inputValue === urlSearch) return;
    const timer = setTimeout(() => {
      isSelfUpdate.current = true;
      const params = new URLSearchParams(searchParams.toString());
      if (inputValue) {
        params.set("search", inputValue);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="pokemon-search" className="sr-only">
        Search Pokémon by name
      </label>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5"
        aria-hidden="true"
      >
        <Search className="h-4 w-4 text-slate-400" strokeWidth={2} />
      </div>

      <input
        id="pokemon-search"
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search Pokémon…"
        aria-label="Search Pokémon by name"
        autoComplete="off"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
      />

      {inputValue && (
        <button
          onClick={() => setInputValue("")}
          aria-label="Clear search"
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
