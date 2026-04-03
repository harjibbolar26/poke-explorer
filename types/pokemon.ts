// Pokemon API Types - PokéAPI v2
// Reference: https://pokeapi.co/docs/v2

export interface PokemonSpecies {
  name: string;
  url: string;
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string;
  front_shiny?: string;
  back_default?: string;
  back_shiny?: string;
  other?: {
    home?: {
      front_default: string;
      front_shiny: string;
    };
    "official-artwork"?: {
      front_default: string;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: PokemonAbility[];
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  species: PokemonSpecies;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonSpecies[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  base_happiness: number;
  capture_rate: number;
  color: {
    name: string;
    url: string;
  };
  egg_groups: {
    name: string;
    url: string;
  }[];
  evolution_chain: {
    url: string;
  };
  shape: {
    name: string;
    url: string;
  };
  variety: {
    is_default: boolean;
    pokemon: PokemonSpecies;
  }[];
}

export interface FilterOption {
  name: string;
  value: string;
}

export interface TypeFilterOption {
  name: string;
  value: string;
}

export interface SearchParams {
  search?: string;
  type?: string;
  sort?: string;
  page?: string;
}

export interface CacheControl {
  revalidate?: number;
  maxAge?: number;
}
