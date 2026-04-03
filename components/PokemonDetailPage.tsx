import { notFound } from "next/navigation";
import { getPokemonById } from "@/lib/api";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import BackButton from "./BackButton";

interface PokemonDetailPageProps {
  params: {
    id: string;
  };
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
};

function getTypeColor(type: string) {
  return TYPE_COLORS[type] ?? "bg-slate-400 text-white";
}

const STAT_COLORS: Record<string, string> = {
  hp: "bg-green-500",
  attack: "bg-red-500",
  defense: "bg-blue-500",
  "special-attack": "bg-purple-500",
  "special-defense": "bg-indigo-500",
  speed: "bg-yellow-500",
};

export default async function PokemonDetailPage({
  params,
}: PokemonDetailPageProps) {
  let pokemon;
  try {
    pokemon = await getPokemonById(params.id);
  } catch {
    return notFound();
  }

  if (!pokemon) return notFound();

  const spritesBase = process.env.NEXT_PUBLIC_POKEMON_SPRITES_BASE ?? "";
  const imageUrl =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default ||
    `${spritesBase}/${pokemon.id}.png`;

  const displayName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <div className="w-full px-6 lg:px-8 py-8">
      <Breadcrumb page={displayName} />

      <div className="mb-8">
        <BackButton className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors group">
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            strokeWidth={2}
          />
          Back to Pokémon List
        </BackButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-white p-8 shadow-sm border border-slate-100 text-center">
            <div className="relative mx-auto h-56 w-56">
              <Image
                src={imageUrl}
                alt={`${displayName} artwork`}
                fill
                priority
                sizes="224px"
                className="object-contain drop-shadow-xl"
              />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              {displayName}
            </h1>
            <p className="text-sm font-medium text-slate-400">
              #{String(pokemon.id).padStart(3, "0")}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {pokemon.types.map((t, i) => (
                <span
                  key={i}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getTypeColor(t.type.name)}`}
                >
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Height", value: `${(pokemon.height / 10).toFixed(1)} m` },
                { label: "Weight", value: `${(pokemon.weight / 10).toFixed(1)} kg` },
                { label: "Base Exp", value: pokemon.base_experience },
                { label: "Order", value: `#${pokemon.order}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Abilities
            </h2>
            <div className="space-y-2">
              {pokemon.abilities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {a.ability.name.replace(/-/g, " ")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {a.is_hidden ? "Hidden Ability" : "Standard Ability"}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      a.is_hidden
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Slot {a.slot}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Base Stats
            </h2>
            <div className="space-y-3">
              {pokemon.stats.map((s, i) => {
                const pct = Math.min((s.base_stat / 255) * 100, 100);
                const barColor = STAT_COLORS[s.stat.name] ?? "bg-indigo-500";
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 capitalize w-32">
                        {s.stat.name.replace(/-/g, " ")}
                      </span>
                      <span className="text-sm font-bold text-slate-900 w-8 text-right">
                        {s.base_stat}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
