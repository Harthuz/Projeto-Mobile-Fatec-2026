export interface Pokemon {
  id: string;
  nome: string;
  tipo: string;
  imagem: { uri: string };
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  electric: "Elétrico",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Venenoso",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
};

function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function fetchPokemons(limit: number = 151): Promise<Pokemon[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar a lista de Pokémons.");
    }

    const data = await response.json();
    const results = data.results as { name: string; url: string }[];

    // Buscando detalhes de cada Pokémon em paralelo
    const detailedPromises = results.map(async (item) => {
      try {
        const detailResponse = await fetch(item.url);
        if (!detailResponse.ok) {
          throw new Error(`Erro ao obter detalhes de ${item.name}`);
        }
        const detailData = await detailResponse.json();

        // Extrai o tipo principal e traduz para português
        const englishType = detailData.types?.[0]?.type?.name || "normal";
        const translatedType = TYPE_TRANSLATIONS[englishType] || capitalize(englishType);

        // Imagem oficial de alta resolução ou fallback para o sprite padrão
        const imageUrl =
          detailData.sprites?.other?.["official-artwork"]?.front_default ||
          detailData.sprites?.front_default ||
          "";

        return {
          id: String(detailData.id),
          nome: capitalize(detailData.name),
          tipo: translatedType,
          imagem: { uri: imageUrl },
        };
      } catch (error) {
        console.error(`Erro ao buscar dados individuais para ${item.name}:`, error);
        return null;
      }
    });

    const detailedPokemons = await Promise.all(detailedPromises);

    // Filtra possíveis nulos e ordena pelo ID numericamente
    return detailedPokemons
      .filter((p): p is Pokemon => p !== null)
      .sort((a, b) => Number(a.id) - Number(b.id));
  } catch (error) {
    console.error("Erro no fetchPokemons:", error);
    throw error;
  }
}
