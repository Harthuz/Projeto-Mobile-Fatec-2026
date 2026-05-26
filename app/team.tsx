import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { BottomNavigation } from "../components/BottomNavigation";
import { fetchPokemons, Pokemon } from "../services/pokemon.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Team() {
  const { isLogged } = useAuth();

  // Estados principais do Time
  const [teamName, setTeamName] = useState("Meu Time Pokémon");
  const [titulares, setTitulares] = useState<(Pokemon | null)[]>([null, null, null, null, null]);
  const [reservas, setReservas] = useState<(Pokemon | null)[]>(Array(25).fill(null));

  // Estados da API / Busca
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  // Estados de Controle de Modais e Slots
  const [modalVisible, setModalVisible] = useState(false);
  const [targetSlot, setTargetSlot] = useState<{ type: "titular" | "reserva"; index: number } | null>(null);

  // Carrega as informações e o time salvos do AsyncStorage
  useEffect(() => {
    async function loadTeamData() {
      try {
        const savedName = await AsyncStorage.getItem("@team_name");
        const savedTitulares = await AsyncStorage.getItem("@team_titulares");
        const savedReservas = await AsyncStorage.getItem("@team_reservas");

        if (savedName) setTeamName(savedName);
        if (savedTitulares) {
          setTitulares(JSON.parse(savedTitulares));
        }
        if (savedReservas) {
          setReservas(JSON.parse(savedReservas));
        }
      } catch (err) {
        console.error("Erro ao carregar dados do time:", err);
      }
    }

    loadTeamData();
  }, []);

  // Prepara a lista de Pokémons da API
  const loadApiPokemons = async () => {
    if (allPokemons.length > 0) return; // Já carregado
    setApiLoading(true);
    try {
      const list = await fetchPokemons(151);
      setAllPokemons(list);
      setFilteredPokemons(list);
    } catch (err) {
      console.error("Erro ao buscar pokémons na API:", err);
    } finally {
      setApiLoading(false);
    }
  };

  if (!isLogged) {
    return <Redirect href="/" />;
  }

  // Salva o Nome do Time no cache
  const handleSaveTeamName = async (name: string) => {
    setTeamName(name);
    try {
      await AsyncStorage.setItem("@team_name", name);
    } catch (err) {
      console.error("Erro ao salvar nome do time:", err);
    }
  };

  // Abre o modal de busca para selecionar um Pokémon para o slot especificado
  const handleOpenSelector = (type: "titular" | "reserva", index: number) => {
    setTargetSlot({ type, index });
    setModalVisible(true);
    loadApiPokemons();
  };

  // Trata a seleção de um Pokémon
  const handleSelectPokemon = async (pokemon: Pokemon) => {
    if (!targetSlot) return;

    const { type, index } = targetSlot;
    if (type === "titular") {
      const newTitulares = [...titulares];
      newTitulares[index] = pokemon;
      setTitulares(newTitulares);
      await AsyncStorage.setItem("@team_titulares", JSON.stringify(newTitulares));
    } else {
      const newReservas = [...reservas];
      newReservas[index] = pokemon;
      setReservas(newReservas);
      await AsyncStorage.setItem("@team_reservas", JSON.stringify(newReservas));
    }

    setModalVisible(false);
    setSearchQuery("");
    setTargetSlot(null);
  };

  // Remove um Pokémon do slot
  const handleRemovePokemon = async (type: "titular" | "reserva", index: number) => {
    if (type === "titular") {
      const newTitulares = [...titulares];
      newTitulares[index] = null;
      setTitulares(newTitulares);
      await AsyncStorage.setItem("@team_titulares", JSON.stringify(newTitulares));
    } else {
      const newReservas = [...reservas];
      newReservas[index] = null;
      setReservas(newReservas);
      await AsyncStorage.setItem("@team_reservas", JSON.stringify(newReservas));
    }
  };

  // Trata digitação no campo de busca do modal
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPokemons(allPokemons);
      return;
    }
    const filtered = allPokemons.filter((p) =>
      p.nome.toLowerCase().includes(query.toLowerCase()) || p.id.includes(query)
    );
    setFilteredPokemons(filtered);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.pokeballHeader}>
            <View style={styles.pokeballTop} />
            <View style={styles.pokeballStripe} />
            <View style={styles.pokeballBottom} />
            <View style={styles.pokeballBtn} />
          </View>
          <Text style={styles.headerTitle}>MEU TIME</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Editor de Nome do Time */}
        <View style={styles.nameCard}>
          <Text style={styles.inputLabel}>NOME DO SEU TIME</Text>
          <View style={styles.nameInputContainer}>
            <Ionicons name="pencil-sharp" size={16} color="#8FA8C0" style={styles.pencilIcon} />
            <TextInput
              style={styles.nameInput}
              value={teamName}
              onChangeText={handleSaveTeamName}
              placeholder="Digite o nome do time..."
              placeholderTextColor="#8FA8C0"
              maxLength={24}
              autoCorrect={false}
            />
          </View>
        </View>

        {/* ── Seção Titulares (5 slots) ── */}
        <Text style={styles.sectionTitle}>Titulares (máx. 5)</Text>
        <View style={styles.titularesContainer}>
          {titulares.map((pokemon, idx) => (
            <View key={idx} style={styles.titularWrapper}>
              {pokemon ? (
                <View style={styles.titularCard}>
                  {/* Remove Button */}
                  <TouchableOpacity
                    style={styles.removeBadge}
                    onPress={() => handleRemovePokemon("titular", idx)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.titularImageWrap}>
                    <Image source={pokemon.imagem} style={styles.titularImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.titularName} numberOfLines={1}>
                    {pokemon.nome}
                  </Text>
                  <View style={styles.typeBadgeCompact}>
                    <Text style={styles.typeTextCompact}>{pokemon.tipo}</Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.titularEmpty}
                  onPress={() => handleOpenSelector("titular", idx)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="add" size={24} color="rgba(255, 255, 255, 0.15)" />
                  <Text style={styles.emptyText}>Slot {idx + 1}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* ── Seção Reservas (25 slots) ── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Reservas (máx. 25)</Text>
        <View style={styles.reservasGrid}>
          {reservas.map((pokemon, idx) => (
            <View key={idx} style={styles.reservaWrapper}>
              {pokemon ? (
                <View style={styles.reservaCard}>
                  <TouchableOpacity
                    style={styles.removeBadgeSmall}
                    onPress={() => handleRemovePokemon("reserva", idx)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={10} color="#FFFFFF" />
                  </TouchableOpacity>

                  <Image source={pokemon.imagem} style={styles.reservaImage} resizeMode="contain" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.reservaEmpty}
                  onPress={() => handleOpenSelector("reserva", idx)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="add" size={16} color="rgba(255, 255, 255, 0.15)" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Modal de Seleção de Pokémon ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha um Pokémon</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Input de Busca */}
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={18} color="#8FA8C0" style={styles.searchIcon} />
              <TextInput
                style={styles.searchBar}
                placeholder="Pesquisar por nome ou ID..."
                placeholderTextColor="#8FA8C0"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            {/* Lista dos Pokémons */}
            {apiLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#E53935" />
                <Text style={styles.loadingText}>Acessando PokéAPI...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredPokemons}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectorItem}
                    onPress={() => handleSelectPokemon(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.selectorImageWrap}>
                      <Image source={item.imagem} style={styles.selectorImage} resizeMode="contain" />
                    </View>

                    <View style={styles.selectorInfo}>
                      <Text style={styles.selectorId}>#{String(item.id).padStart(3, "0")}</Text>
                      <Text style={styles.selectorName}>{item.nome}</Text>
                    </View>

                    <View style={styles.selectorTypeBadge}>
                      <Text style={styles.selectorTypeText}>{item.tipo}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Navegação Inferior */}
      <BottomNavigation activeTab="team" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  pokeballHeader: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
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
    height: 3,
    backgroundColor: "#111",
    marginTop: -1.5,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#bd3e3e",
    borderWidth: 1.5,
    borderColor: "#111",
    top: "50%",
    left: "50%",
    marginTop: -4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // espaço para navegação inferior
  },
  nameCard: {
    width: "100%",
    backgroundColor: "#162234",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8FA8C0",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  nameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  pencilIcon: {
    marginRight: 8,
  },
  nameInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8FA8C0",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#E53935",
    paddingLeft: 8,
  },

  // Titulares
  titularesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  titularWrapper: {
    width: (SCREEN_WIDTH - 40 - 16) / 2 - 4, // 2 por linha com proporção adequada
    height: 140,
    marginBottom: 8,
  },
  titularCard: {
    flex: 1,
    backgroundColor: "#162234",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 214, 0, 0.25)", // brilho dourado sutil
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    position: "relative",
    shadowColor: "#FFD600",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  titularEmpty: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.06)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.25)",
    fontSize: 11,
    fontWeight: "700",
  },
  removeBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(229,57,53,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  titularImageWrap: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  titularImage: {
    width: 52,
    height: 52,
  },
  titularName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  typeBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  typeTextCompact: {
    color: "#8FA8C0",
    fontSize: 9,
    fontWeight: "700",
  },

  // Reservas Grid
  reservasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  reservaWrapper: {
    width: (SCREEN_WIDTH - 40 - 24) / 5, // 5 colunas perfeitas
    height: (SCREEN_WIDTH - 40 - 24) / 5,
    marginBottom: 6,
  },
  reservaCard: {
    flex: 1,
    backgroundColor: "#162234",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  reservaEmpty: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.01)",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.04)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBadgeSmall: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(229,57,53,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  reservaImage: {
    width: "80%",
    height: "80%",
  },

  // Modal CSS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(6, 12, 22, 0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "75%",
    backgroundColor: "#0D1B2A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#162234",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    marginHorizontal: 24,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#FFFFFF",
  },
  modalList: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  modalLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#8FA8C0",
    fontSize: 14,
    fontWeight: "500",
  },
  selectorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#162234",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  selectorImageWrap: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectorImage: {
    width: 38,
    height: 38,
  },
  selectorInfo: {
    flex: 1,
  },
  selectorId: {
    color: "#8FA8C0",
    fontSize: 10,
    fontWeight: "700",
  },
  selectorName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  selectorTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  selectorTypeText: {
    color: "#8FA8C0",
    fontSize: 10,
    fontWeight: "700",
  },
});
