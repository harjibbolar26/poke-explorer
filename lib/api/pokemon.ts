import {
  Pokemon,
  PokemonListResponse,
  PokemonType,
  PokemonAbility,
  PokemonStat,
} from "@/types/pokemon";

const BASE_URL = process.env.NEXT_PUBLIC_POKEAPI_BASE_URL ?? "";
const SPRITES_BASE = process.env.NEXT_PUBLIC_POKEMON_SPRITES_BASE ?? "";

function assertEnv() {
  if (!BASE_URL)
    throw new Error(
      "Missing env var: NEXT_PUBLIC_POKEAPI_BASE_URL — add it to .env.local and restart the dev server.",
    );
  if (!SPRITES_BASE)
    throw new Error(
      "Missing env var: NEXT_PUBLIC_POKEMON_SPRITES_BASE — add it to .env.local and restart the dev server.",
    );
}

const CACHE_REVALIDATE = 3600;

async function fetchPokemonDetails(url: string): Promise<Pokemon> {
  const response = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: CACHE_REVALIDATE },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Pokémon detail (${url}): ${response.statusText}`,
    );
  }
  return response.json();
}

function mapDetailToPokemon(detail: Pokemon): Pokemon {
  const imageUrl =
    detail.sprites.other?.["official-artwork"]?.front_default ||
    detail.sprites.front_default ||
    `${SPRITES_BASE}/${detail.id}.png`;

  const types: PokemonType[] = detail.types.map((t, index) => ({
    slot: index + 1,
    type: { name: t.type.name, url: t.type.url },
  }));

  const abilities: PokemonAbility[] = detail.abilities.map((a) => ({
    ability: { name: a.ability.name, url: a.ability.url },
    is_hidden: a.is_hidden,
    slot: a.slot,
  }));

  const stats: PokemonStat[] = detail.stats.map((s) => ({
    base_stat: s.base_stat,
    effort: s.effort,
    stat: { name: s.stat.name, url: s.stat.url },
  }));

  return {
    id: detail.id,
    name: detail.name,
    base_experience: detail.base_experience,
    height: detail.height,
    is_default: true,
    order: detail.order,
    weight: detail.weight,
    abilities,
    types,
    stats,
    sprites: {
      front_default: imageUrl,
      other: {
        home: { front_default: imageUrl, front_shiny: imageUrl },
        "official-artwork": { front_default: imageUrl },
      },
    },
    species: {
      name: detail.name,
      url: `${BASE_URL}/pokemon/${detail.id}`,
    },
    moves: [],
  };
}

export async function getPokemonListPaginated(
  limit: number = 20,
  offset: number = 0,
  search?: string,
  typeFilter?: string,
): Promise<{ pokemons: Pokemon[]; totalCount: number; hasMore: boolean }> {
  assertEnv();
  let candidateNames: string[] | null = null;

  if (typeFilter) {
    const typeResp = await fetch(`${BASE_URL}/type/${typeFilter}`, {
      cache: "force-cache",
      next: { revalidate: CACHE_REVALIDATE },
    });
    if (typeResp.ok) {
      const typeData = await typeResp.json();
      candidateNames = (
        typeData.pokemon as Array<{ pokemon: { name: string } }>
      ).map((entry) => entry.pokemon.name);
    }
  }

  if (search) {
    const q = search.toLowerCase();
    if (candidateNames !== null) {
      candidateNames = candidateNames.filter((name) =>
        name.toLowerCase().includes(q),
      );
    } else {
      const allResp = await fetch(`${BASE_URL}/pokemon?limit=10000&offset=0`, {
        cache: "force-cache",
        next: { revalidate: CACHE_REVALIDATE },
      });
      if (allResp.ok) {
        const allData: PokemonListResponse = await allResp.json();
        candidateNames = allData.results
          .filter((p) => p.name.toLowerCase().includes(q))
          .map((p) => p.name);
      }
    }
  }

  let total: number;
  let pageNames: string[];

  if (candidateNames !== null) {
    total = candidateNames.length;
    pageNames = candidateNames.slice(offset, offset + limit);
  } else {
    const countResp = await fetch(`${BASE_URL}/pokemon?limit=0&offset=0`, {
      cache: "force-cache",
      next: { revalidate: CACHE_REVALIDATE },
    });
    if (!countResp.ok) {
      throw new Error(`Failed to fetch Pokémon count: ${countResp.statusText}`);
    }
    const countData: PokemonListResponse = await countResp.json();
    total = countData.count;

    const pageResp = await fetch(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
      { cache: "force-cache", next: { revalidate: CACHE_REVALIDATE } },
    );
    if (!pageResp.ok) {
      throw new Error(`Failed to fetch Pokémon page: ${pageResp.statusText}`);
    }
    const pageData: PokemonListResponse = await pageResp.json();
    pageNames = pageData.results.map((p) => p.name);
  }

  const pokemons: Pokemon[] = [];
  for (const name of pageNames) {
    try {
      const detail = await fetchPokemonDetails(`${BASE_URL}/pokemon/${name}`);
      pokemons.push(mapDetailToPokemon(detail));
    } catch (err) {
      console.warn(`Skipping ${name}: ${err}`);
    }
  }

  return {
    pokemons,
    totalCount: total,
    hasMore: offset + limit < total,
  };
}

export async function getPokemonById(
  idOrName: string | number,
): Promise<Pokemon> {
  assertEnv();
  const response = await fetch(`${BASE_URL}/pokemon/${idOrName}`, {
    cache: "force-cache",
    next: { revalidate: CACHE_REVALIDATE },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Pokémon "${idOrName}": ${response.statusText}`,
    );
  }
  const data: Pokemon = await response.json();
  return mapDetailToPokemon(data);
}

export async function getTypes(): Promise<string[]> {
  assertEnv();
  const response = await fetch(`${BASE_URL}/type?limit=100`, {
    cache: "force-cache",
    next: { revalidate: CACHE_REVALIDATE },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch types: ${response.statusText}`);
  }
  const data: { results: { name: string }[] } = await response.json();
  return data.results.map((r) => r.name).sort();
}

export async function getPokemonCount(): Promise<number> {
  assertEnv();
  const response = await fetch(`${BASE_URL}/pokemon?limit=0&offset=0`, {
    cache: "force-cache",
    next: { revalidate: CACHE_REVALIDATE },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon count: ${response.statusText}`);
  }
  const data: { count: number } = await response.json();
  return data.count;
}
