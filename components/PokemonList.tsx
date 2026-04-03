"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { AlertCircle, Frown, X, Loader2 } from "lucide-react";
import PokemonCard from "./PokemonCard";
import { Pokemon } from "@/types/pokemon";
import { getPokemonListPaginated, getTypes } from "@/lib/api";

const ITEMS_PER_PAGE = 20;

export default function PokemonList({
  initialPokemons = [],
  initialCount = 0,
}: {
  initialPokemons?: Pokemon[];
  initialCount?: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [pokemons, setPokemons] = useState<Pokemon[]>(initialPokemons);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialCount > ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<string[]>([]);

  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  useEffect(() => {
    getTypes()
      .then(setTypes)
      .catch((err) => console.error("Failed to fetch types:", err));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPokemonListPaginated(ITEMS_PER_PAGE, 0, search, type);
        if (cancelled) return;
        setPokemons(data.pokemons);
        setTotalCount(data.totalCount);
        setHasMore(data.hasMore);
        setPage(0);
      } catch (err) {
        if (!cancelled) {
          console.error("Fetch error:", err);
          setError("Failed to load Pokémon. Please try again.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [search, type]);

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const offset = (page + 1) * ITEMS_PER_PAGE;
      const data = await getPokemonListPaginated(ITEMS_PER_PAGE, offset, search, type);
      setPokemons((prev) => [...prev, ...data.pokemons]);
      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("type", e.target.value);
    } else {
      params.delete("type");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="sticky top-16 z-10 -mx-6 px-6 lg:-mx-8 lg:px-8 bg-white/95 backdrop-blur-sm border-b border-slate-100 py-3">
          <div className="flex items-center justify-between">
            <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-white border border-slate-100 overflow-hidden"
            >
              <div className="aspect-square bg-slate-100" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 w-8 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
                <div className="flex justify-between pt-2">
                  <div className="h-3 w-10 bg-slate-100 rounded" />
                  <div className="h-3 w-10 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-12 text-center mt-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-7 w-7 text-red-600" strokeWidth={2} />
        </div>
        <h3 className="text-base font-semibold text-red-900">Something went wrong</h3>
        <p className="mt-1.5 text-sm text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isEmpty = !isLoading && !error && pokemons.length === 0;
  if (isEmpty) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-16 text-center mt-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Frown className="h-7 w-7 text-slate-400" strokeWidth={2} />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Pokémon Found</h3>
        <p className="mt-1.5 text-sm text-slate-500">
          {search
            ? `No results for "${search}"`
            : type
              ? `No Pokémon in the "${type}" type`
              : "Try adjusting your search or filters."}
        </p>
        {(search || type) && (
          <button
            onClick={clearFilters}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-10 -mx-6 px-6 lg:-mx-8 lg:px-8 bg-white/95 backdrop-blur-sm border-b border-slate-100 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <>
              <label htmlFor="type-filter" className="sr-only">
                Filter by Pokémon type
              </label>
              <select
                id="type-filter"
                value={type}
                onChange={handleTypeChange}
                aria-label="Filter by Pokémon type"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all cursor-pointer"
              >
                <option value="">All Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </>

            {(search || type) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                Clear Filters
              </button>
            )}
          </div>

          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="text-sm text-slate-500 shrink-0"
          >
            <span className="font-bold text-slate-900">
              {totalCount || pokemons.length}
            </span>{" "}
            Pokémon
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pokemons.map((pokemon, index) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Loading…
              </>
            ) : (
              "Load More Pokémon"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
