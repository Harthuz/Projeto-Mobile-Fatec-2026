import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Redirect } from "expo-router";

import { PokemonCard } from "../components/PokemonCard";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { fetchPokemons, Pokemon } from "../services/pokemon.service";

export default function Pokemons() {
  const { isLogged, logout } = useAuth();
  
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPokemons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPokemons(151);
      setPokemonList(data);
    } catch (err) {
      setError("Não foi possível carregar os pokémons. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemons();
  }, []);

  if (!isLogged) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.pokeball}>
            <View style={styles.pokeballTop} />
            <View style={styles.pokeballStripe} />
            <View style={styles.pokeballBottom} />
            <View style={styles.pokeballBtn} />
          </View>
          <View>
            <Text style={styles.headerTitle}>POKÉDEX</Text>
            <Text style={styles.headerSub}>
              {loading ? "Carregando..." : `${pokemonList.length} pokémons`}
            </Text>
          </View>
        </View>

        <Button
          title="Sair"
          onPress={logout}
          variant="danger"
          style={{ width: 90, marginTop: 0 }}
        />
      </View>

      {/* ── Conteúdo Principal ── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#E53935" size="large" />
          <Text style={styles.loadingText}>Carregando Pokédex...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Tentar Novamente"
            onPress={loadPokemons}
            style={{ width: 220 }}
          />
        </View>
      ) : (
        /* ── Lista de Pokémons ── */
        <FlatList
          data={pokemonList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Seus Pokémons</Text>
          }
          renderItem={({ item }) => (
            <PokemonCard
              nome={item.nome}
              tipo={item.tipo}
              imagem={item.imagem}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E53935",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#B71C1C",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Mini pokéball no header
  pokeball: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#111",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff",
  },
  pokeballTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#E53935",
  },
  pokeballStripe: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#111",
    marginTop: -2,
  },
  pokeballBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#EFEFEF",
  },
  pokeballBtn: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#bd3e3e",
    borderWidth: 2,
    borderColor: "#111",
    top: "50%",
    left: "50%",
    marginTop: -5,
    marginLeft: -5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 3,
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // Conteúdos Auxiliares (Loading / Erro)
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#8FA8C0",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  errorText: {
    fontSize: 15,
    color: "#F48FB1",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },

  // Lista
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8FA8C0",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
});