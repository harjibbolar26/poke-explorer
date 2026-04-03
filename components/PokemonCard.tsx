"use client";

import { Pokemon } from "@/types/pokemon";
import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

interface PokemonCardProps {
  pokemon: Pokemon;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-slate-400 text-white",
  fire: "bg-orange-500 text-white",
  water: "bg-blue-500 text-white",
  electric: "bg-yellow-400 text-yellow-900",
  grass: "bg-green-500 text-white",
  ice: "bg-cyan-400 text-cyan-900",
  fighting: "bg-red-600 text-white",
  poison: "bg-purple-500 text-white",
  ground: "bg-amber-600 text-white",
  flying: "bg-violet-400 text-white",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-600 text-white",
  rock: "bg-stone-500 text-white",
  ghost: "bg-purple-700 text-white",
  dragon: "bg-indigo-700 text-white",
  steel: "bg-slate-500 text-white",
  fairy: "bg-pink-400 text-white",
  dark: "bg-stone-700 text-white",
  shadow: "bg-purple-900 text-white",
  unknown: "bg-gray-400 text-white",
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? "bg-slate-400 text-white";
}

const PokemonCard = memo(({ pokemon, index }: PokemonCardProps) => {
  const spritesBase = process.env.NEXT_PUBLIC_POKEMON_SPRITES_BASE ?? "";
  const imageUrl =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default ||
    `${spritesBase}/${pokemon.id}.png`;

  const displayName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      prefetch={index < 10}
      aria-label={`View details for ${displayName}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Image
          src={imageUrl}
          alt={`${displayName} sprite`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          priority={index < 6}
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {pokemon.types.slice(0, 2).map((t, i) => (
            <span
              key={i}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm ${getTypeColor(t.type.name)}`}
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
          #{String(pokemon.id).padStart(3, "0")}
        </span>
        <h3 className="mt-0.5 text-sm font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
          {displayName}
        </h3>

        <div className="mt-auto pt-3 flex justify-between text-[10px] text-slate-500">
          <div>
            <span className="block uppercase tracking-wider text-slate-400" aria-hidden="true">
              Exp
            </span>
            <span className="font-semibold text-slate-700">
              {pokemon.base_experience}
            </span>
          </div>
          <div className="text-right">
            <span className="block uppercase tracking-wider text-slate-400" aria-hidden="true">
              Wt
            </span>
            <span className="font-semibold text-slate-700">
              {(pokemon.weight / 10).toFixed(1)} kg
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

PokemonCard.displayName = "PokemonCard";

export default PokemonCard;
