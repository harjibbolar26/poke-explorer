import PokemonDetailPage from "@/components/PokemonDetailPage";
import { getPokemonById } from "@/lib/api";

// Pre-generate the first 151 Pokémon for static serving (fast navigation)
export async function generateStaticParams() {
  return Array.from({ length: 151 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const pokemon = await getPokemonById(id);
    const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const imageUrl =
      pokemon.sprites.other?.["official-artwork"]?.front_default ||
      `${process.env.NEXT_PUBLIC_POKEMON_SPRITES_BASE}/${pokemon.id}.png`;
    return {
      title: `${name} – Pokémon Details`,
      description: `View stats, types, and abilities for ${name}.`,
      openGraph: {
        title: `${name} – PokeExplorer`,
        description: `Complete information about ${name}.`,
        images: [{ url: imageUrl, alt: `${name} artwork` }],
      },
    };
  } catch {
    return { title: "Pokémon Not Found" };
  }
}

export default async function PokemonDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PokemonDetailPage params={{ id }} />;
}
