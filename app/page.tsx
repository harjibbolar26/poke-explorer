import { Suspense } from "react";
import type { Metadata } from "next";
import PokemonListServer from "@/components/PokemonListServer";

export const metadata: Metadata = {
  title: "PokeExplorer – Discover Pokémon",
  description: "Browse and discover Pokémon from the official PokéAPI.",
  openGraph: {
    title: "PokeExplorer",
    description: "Discover and explore all Pokémon from PokéAPI",
  },
};

function PokemonGridSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-10 -mx-6 px-6 lg:-mx-8 lg:px-8 bg-white/95 backdrop-blur-sm border-b border-slate-100 py-3">
        <div className="flex items-center justify-between">
          <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
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

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] }>;
}) {
  const p = await searchParams;

  const str = (key: string): string => {
    const v = p?.[key];
    return Array.isArray(v) ? v[0] : v || "";
  };

  const search = str("search");
  const type = str("type");
  const page = parseInt(str("page") || "1", 10);
  const offset = (page - 1) * 20;

  return (
    <div className="w-full px-6 lg:px-8 py-8">
      <Suspense fallback={<PokemonGridSkeleton />}>
        <PokemonListServer search={search} type={type} offset={offset} />
      </Suspense>
    </div>
  );
}
