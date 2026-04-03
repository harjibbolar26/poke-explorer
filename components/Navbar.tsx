import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header
      role="banner"
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
    >
      <div className="w-full px-6 lg:px-8">
        <nav aria-label="Site navigation" className="flex h-16 items-center gap-6">
          <Link
            href="/"
            aria-label="PokeExplorer — go to homepage"
            className="flex items-center gap-2.5 shrink-0"
          >
            <Image
              src="/pokemon.png"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              PokeExplorer
            </span>
          </Link>

          <div className="flex-1" role="search">
            <Suspense
              fallback={
                <div
                  aria-label="Loading search"
                  className="h-10 w-full animate-pulse rounded-xl bg-slate-100"
                />
              }
            >
              <SearchBar />
            </Suspense>
          </div>
        </nav>
      </div>
    </header>
  );
}
