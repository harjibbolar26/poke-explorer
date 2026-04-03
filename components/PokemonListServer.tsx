/*
 * B-2: React 18 Streaming with Suspense
 *
 * Pure async Server Component — never touches the client bundle.
 * Wrapped in `Suspense` by its parent so Next.js:
 *  1. Sends the page shell (navbar + skeleton fallback) to the browser immediately.
 *  2. Streams this component's HTML in-band once the PokéAPI fetch resolves.
 *
 * No client-side loading state is used for this fetch path.
 */
import PokemonList from "./PokemonList";
import { getPokemonListPaginated } from "@/lib/api";

interface PokemonListServerProps {
  search: string;
  type: string;
  offset: number;
}

export default async function PokemonListServer({
  search,
  type,
  offset,
}: PokemonListServerProps) {
  // This await happens server-side, inside the Suspense boundary.
  // The browser already received the skeleton while this was pending.
  const data = await getPokemonListPaginated(20, offset, search, type);

  return (
    <PokemonList
      initialPokemons={data.pokemons}
      initialCount={data.totalCount}
    />
  );
}
