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
import { apiService } from "../services/api.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");


const TYPE_COLORS_RESERVA: Record<string, { bg: string; text: string }> = {
  Elétrico: { bg: "rgba(255,214,0,0.18)",   text: "#FFD600" },
  Fogo:     { bg: "rgba(255,107,53,0.18)",  text: "#FF8A65" },
  Água:     { bg: "rgba(79,195,247,0.18)",  text: "#4FC3F7" },
  Planta:   { bg: "rgba(102,187,106,0.18)", text: "#66BB6A" },
  Fantasma: { bg: "rgba(171,71,188,0.18)",  text: "#CE93D8" },
  Normal:   { bg: "rgba(168,168,168,0.12)", text: "#BDBDBD" },
  Psíquico: { bg: "rgba(240,98,146,0.18)",  text: "#F48FB1" },
  Pedra:    { bg: "rgba(161,136,127,0.18)", text: "#BCAAA4" },
  Lutador:  { bg: "rgba(255,138,101,0.18)", text: "#FF8A65" },
  Venenoso: { bg: "rgba(186,104,200,0.18)", text: "#CE93D8" },
  Terra:    { bg: "rgba(215,160,110,0.18)", text: "#D7A06E" },
  Voador:   { bg: "rgba(144,202,249,0.18)", text: "#90CAF9" },
  Inseto:   { bg: "rgba(156,204,101,0.18)", text: "#AED581" },
  Dragão:   { bg: "rgba(92,107,192,0.18)",  text: "#9FA8DA" },
  Sombrio:  { bg: "rgba(110,110,110,0.18)", text: "#BDBDBD" },
  Aço:      { bg: "rgba(144,164,174,0.18)", text: "#B0BEC5" },
  Fada:     { bg: "rgba(244,143,177,0.18)", text: "#F48FB1" },
  Gelo:     { bg: "rgba(128,222,234,0.18)", text: "#80DEEA" },
};

function ReservaTypeBadge({ tipo }: { tipo: string }) {
  const palette = TYPE_COLORS_RESERVA[tipo] ?? { bg: "rgba(255,255,255,0.08)", text: "#8FA8C0" };
  return (
    <View style={[reservaBadgeStyle.badge, { backgroundColor: palette.bg }]}>
      <Text style={[reservaBadgeStyle.text, { color: palette.text }]} numberOfLines={1}>
        {tipo}
      </Text>
    </View>
  );
}

const reservaBadgeStyle = StyleSheet.create({
  badge: {
    marginTop: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: "95%",
    alignItems: "center",
  },
  text: {
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default function Team() {
  const { isLogged, userId } = useAuth();

  const [teamName, setTeamName] = useState("Meu Time Pokémon");
  const [titulares, setTitulares] = useState<(Pokemon | null)[]>([null, null, null, null, null]);
  const [reservas, setReservas] = useState<(Pokemon | null)[]>(Array(25).fill(null));

  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [targetSlot, setTargetSlot] = useState<{ type: "titular" | "reserva"; index: number } | null>(null);

  const refreshTeam = async (list: Pokemon[]) => {
    if (!userId) return;
    try {
      const teamData = await apiService.getTeam(userId);
      
      const mappedTitulares: (Pokemon | null)[] = [null, null, null, null, null];
      
      // Carrega a ordem salva localmente para este usuário
      const savedOrderStr = await AsyncStorage.getItem(`@team_order_${userId}`);
      let savedOrder: string[] = [];
      if (savedOrderStr) {
        try {
          savedOrder = JSON.parse(savedOrderStr);
        } catch {
          savedOrder = [];
        }
      }

      if (teamData.team) {
        // Se temos uma ordem salva válida com os Pokémons corretos
        if (savedOrder.length === 5) {
          savedOrder.forEach((id, idx) => {
            const apiItem = teamData.team.find((item) => String(item.index) === String(id));
            if (apiItem) {
              const match = list.find((p) => p.id === String(apiItem.index));
              if (match) mappedTitulares[idx] = match;
            }
          });

          // Caso algum Pokémon do backend não tenha sido mapeado devido a alterações externas,
          // preenchemos os slots que restaram nulos
          teamData.team.forEach((item) => {
            const alreadyMapped = mappedTitulares.some((p) => p && p.id === String(item.index));
            if (!alreadyMapped) {
              const emptyIdx = mappedTitulares.findIndex((p) => p === null);
              if (emptyIdx !== -1) {
                const match = list.find((p) => p.id === String(item.index));
                if (match) mappedTitulares[emptyIdx] = match;
              }
            }
          });

          // Sincroniza a ordem local atualizada (caso algum item tenha sido preenchido fora do savedOrder)
          const finalOrderIds = mappedTitulares.map((p) => p?.id || "");
          if (finalOrderIds.every(Boolean)) {
            await AsyncStorage.setItem(`@team_order_${userId}`, JSON.stringify(finalOrderIds));
          }
        } else {
          // Se não há ordem salva, usamos a ordem padrão retornada pelo backend e a persistimos
          const initialOrder: string[] = [];
          teamData.team.forEach((item, idx) => {
            if (idx < 5) {
              const match = list.find((p) => p.id === String(item.index));
              if (match) {
                mappedTitulares[idx] = match;
                initialOrder.push(match.id);
              }
            }
          });
          if (initialOrder.length === 5) {
            await AsyncStorage.setItem(`@team_order_${userId}`, JSON.stringify(initialOrder));
          }
        }
      }
      setTitulares(mappedTitulares);

      const mappedReservas: (Pokemon | null)[] = Array(25).fill(null);
      if (teamData.capture) {
        teamData.capture.forEach((item, idx) => {
          if (idx < 25) {
            const match = list.find((p) => p.id === String(item.index));
            if (match) mappedReservas[idx] = match;
          }
        });
      }
      setReservas(mappedReservas);
    } catch (err) {
      console.error("Erro ao sincronizar time com a API:", err);
    }
  };

  useEffect(() => {
    async function loadTeamData() {
      if (!userId) return;
      setApiLoading(true);
      try {
        const savedName = await AsyncStorage.getItem("@team_name");
        if (savedName) setTeamName(savedName);

        // Carrega a Pokédex local para mapeamento
        const list = await fetchPokemons(151);
        setAllPokemons(list);
        setFilteredPokemons(list);

        // Carrega time do backend
        await refreshTeam(list);
      } catch (err) {
        console.error("Erro ao carregar dados do time:", err);
      } finally {
        setApiLoading(false);
      }
    }
    loadTeamData();
  }, [userId]);

  const loadApiPokemons = async () => {
    // A lista já é carregada no início (loadTeamData)
  };

  if (!isLogged) {
    return <Redirect href="/" />;
  }

  // Retorna todos os IDs de Pokémons já selecionados (titulares + reservas)
  const getSelectedIds = (): Set<string> => {
    const ids = new Set<string>();
    titulares.forEach((p) => { if (p) ids.add(p.id); });
    reservas.forEach((p) => { if (p) ids.add(p.id); });
    return ids;
  };

  const handleSaveTeamName = async (name: string) => {
    setTeamName(name);
    try {
      await AsyncStorage.setItem("@team_name", name);
    } catch (err) {
      console.error("Erro ao salvar nome do time:", err);
    }
  };

  const handleOpenSelector = (type: "titular" | "reserva", index: number) => {
    setTargetSlot({ type, index });
    setModalVisible(true);
  };

  const handleSelectPokemon = async (pokemon: Pokemon) => {
    if (!targetSlot || !userId) return;

    const { type, index } = targetSlot;
    const currentInSlot = type === "titular" ? titulares[index] : reservas[index];

    setApiLoading(true);
    try {
      if (type === "reserva") {
        // Adiciona à lista de capturados (reserva)
        await apiService.addCaptured(userId, pokemon.id);
        await refreshTeam(allPokemons);
      } else {
        // Adiciona ao time titular
        if (currentInSlot) {
          // Se já existe um Pokémon no slot, substituímos ele
          // Certifica que o novo Pokémon já está capturado
          const isCaptured = reservas.some((r) => r && r.id === pokemon.id);
          if (!isCaptured) {
            await apiService.addCaptured(userId, pokemon.id);
          }
          
          // 1. Envia a alteração de swap para a API
          await apiService.swapTeam(userId, currentInSlot.id, pokemon.id);

          // 2. Constrói e salva a nova ordem de visualização no AsyncStorage
          const newOrder = titulares.map((p, idx) => {
            if (idx === index) return pokemon.id;
            return p ? p.id : "";
          }).filter(Boolean);
          
          await AsyncStorage.setItem(`@team_order_${userId}`, JSON.stringify(newOrder));

          // 3. Informa a nova ordenação correta para o backend
          try {
            await apiService.reorderTeam(userId, newOrder);
          } catch (reorderErr) {
            console.warn("Erro ao reordenar time no servidor:", reorderErr);
          }

          // 4. Atualiza os dados locais
          await refreshTeam(allPokemons);
        } else {
          // Caso incompleto
          await apiService.addCaptured(userId, pokemon.id);
          alert("O time titular deve ter 5 Pokémons. Substitua um Pokémon existente.");
        }
      }
    } catch (err: any) {
      console.error("Erro ao atualizar time:", err);
      alert(err.message || "Erro ao atualizar dados na API.");
    } finally {
      setApiLoading(false);
      setModalVisible(false);
      setSearchQuery("");
      setTargetSlot(null);
    }
  };

  const handleRemovePokemon = async (type: "titular" | "reserva", index: number) => {
    if (!userId) return;

    if (type === "titular") {
      // Abre o seletor para trocar o titular diretamente, mostrando o banner de obrigatoriedade
      handleOpenSelector("titular", index);
      return;
    }

    const pokemon = reservas[index];
    if (!pokemon) return;

    setApiLoading(true);
    try {
      await apiService.deleteCaptured(userId, pokemon.id);
      await refreshTeam(allPokemons);
    } catch (err: any) {
      alert(err.message || "Erro ao remover Pokémon capturado.");
    } finally {
      setApiLoading(false);
    }
  };

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

  const selectedIds = getSelectedIds();

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
        {/* Editor de Nome */}
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

        {/* ── Titulares ── */}
        <Text style={styles.sectionTitle}>Titulares (máx. 5)</Text>
        <View style={styles.titularesContainer}>
          {titulares.map((pokemon, idx) => (
            <View key={idx} style={styles.titularWrapper}>
              {pokemon ? (
                <View style={styles.titularCard}>
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

        {/* ── Reservas ── */}
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

                  <Text style={styles.reservaName} numberOfLines={1}>
                    {pokemon.nome}
                  </Text>
                  <ReservaTypeBadge tipo={pokemon.tipo} />
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

      {/* ── Modal de Seleção ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha um Pokémon</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {targetSlot?.type === "titular" && (
              <View style={styles.bannerContainer}>
                <Ionicons name="warning" size={18} color="#FFD600" />
                <Text style={styles.bannerText}>
                  Atenção: O time titular deve ter sempre 5 Pokémons. Selecione um substituto para continuar.
                </Text>
              </View>
            )}

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
                renderItem={({ item }) => {
                  const isSelected = selectedIds.has(item.id);
                  // Verifica se o slot atual já tem esse pokémon (troca permitida)
                  const currentInSlot = targetSlot
                    ? (targetSlot.type === "titular" ? titulares[targetSlot.index] : reservas[targetSlot.index])
                    : null;
                  const isCurrentSlot = currentInSlot?.id === item.id;
                  const isDisabled = isSelected && !isCurrentSlot;

                  return (
                    <TouchableOpacity
                      style={[styles.selectorItem, isDisabled && styles.selectorItemDisabled]}
                      onPress={() => !isDisabled && handleSelectPokemon(item)}
                      activeOpacity={isDisabled ? 1 : 0.8}
                    >
                      <View style={styles.selectorImageWrap}>
                        <Image
                          source={item.imagem}
                          style={[styles.selectorImage, isDisabled && styles.selectorImageGrayscale]}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={styles.selectorInfo}>
                        <Text style={styles.selectorId}>#{String(item.id).padStart(3, "0")}</Text>
                        <Text style={[styles.selectorName, isDisabled && styles.selectorNameDisabled]}>
                          {item.nome}
                        </Text>
                      </View>

                      <View style={styles.selectorTypeBadge}>
                        <Text style={styles.selectorTypeText}>{item.tipo}</Text>
                      </View>

                      {isDisabled && (
                        <View style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      <BottomNavigation activeTab="team" />
    </View>
  );
}

const RESERVA_CELL = (SCREEN_WIDTH - 40 - 24) / 5;

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
    paddingBottom: 120,
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
    width: (SCREEN_WIDTH - 40 - 16) / 2 - 4,
    height: 140,
    marginBottom: 8,
  },
  titularCard: {
    flex: 1,
    backgroundColor: "#162234",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 214, 0, 0.25)",
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

  // Reservas Grid — células mais altas para acomodar nome e tipo
  reservasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  reservaWrapper: {
    width: RESERVA_CELL,
    marginBottom: 6,
  },
  reservaCard: {
    backgroundColor: "#162234",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 3,
    minHeight: RESERVA_CELL + 52,
  },
  reservaEmpty: {
    height: RESERVA_CELL,
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
    width: RESERVA_CELL * 0.60,
    height: RESERVA_CELL * 0.60,
  },
  reservaName: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 2,
  },
  reservaTypeBadge: {
    marginTop: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.07)",
    maxWidth: "90%",
  },
  reservaTypeText: {
    color: "#8FA8C0",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },

  // Modal
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
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 214, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 214, 0, 0.2)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  bannerText: {
    color: "#FFD600",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
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
  selectorItemDisabled: {
    opacity: 0.5,
    borderColor: "rgba(255,255,255,0.03)",
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
  // Grayscale via tintColor em React Native (simula dessaturação)
  selectorImageGrayscale: {
    opacity: 0.4,
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
  selectorNameDisabled: {
    color: "#8FA8C0",
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
  selectedBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
  },
});
