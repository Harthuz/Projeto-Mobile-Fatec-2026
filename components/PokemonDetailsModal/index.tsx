import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pokemon } from "../../services/pokemon.service";

type Props = {
  pokemon: Pokemon | null;
  visible: boolean;
  onClose: () => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TYPE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  Elétrico: { bg: "rgba(255,214,0,0.15)",   text: "#FFD600", accent: "#FFD600" },
  Fogo:     { bg: "rgba(255,107,53,0.15)",  text: "#FF6B35", accent: "#FF6B35" },
  Água:     { bg: "rgba(79,195,247,0.15)",  text: "#4FC3F7", accent: "#4FC3F7" },
  Planta:   { bg: "rgba(102,187,106,0.15)", text: "#66BB6A", accent: "#66BB6A" },
  Fantasma: { bg: "rgba(171,71,188,0.15)",  text: "#AB47BC", accent: "#AB47BC" },
  Normal:   { bg: "rgba(168,168,168,0.15)", text: "#A8A8A8", accent: "#A8A8A8" },
  Psíquico: { bg: "rgba(240,98,146,0.15)",  text: "#F06292", accent: "#F06292" },
  Pedra:    { bg: "rgba(161,136,127,0.15)", text: "#A1887F", accent: "#A1887F" },
  Lutador:  { bg: "rgba(255,138,101,0.15)", text: "#FF8A65", accent: "#FF8A65" },
  Venenoso: { bg: "rgba(186,104,200,0.15)", text: "#BA68C8", accent: "#BA68C8" },
  Terra:    { bg: "rgba(215,160,110,0.15)", text: "#D7A06E", accent: "#D7A06E" },
  Voador:   { bg: "rgba(144,202,249,0.15)", text: "#90CAF9", accent: "#90CAF9" },
  Inseto:   { bg: "rgba(156,204,101,0.15)", text: "#9CCC65", accent: "#9CCC65" },
  Dragão:   { bg: "rgba(92,107,192,0.15)",  text: "#5C6BC0", accent: "#5C6BC0" },
  Sombrio:  { bg: "rgba(110,110,110,0.15)", text: "#8E8E8E", accent: "#8E8E8E" },
  Aço:      { bg: "rgba(144,164,174,0.15)", text: "#90A4AE", accent: "#90A4AE" },
  Fada:     { bg: "rgba(244,143,177,0.15)", text: "#F48FB1", accent: "#F48FB1" },
  Gelo:     { bg: "rgba(128,222,234,0.15)", text: "#80DEEA", accent: "#80DEEA" },
};

const DEFAULT_COLORS = { bg: "rgba(255,255,255,0.06)", text: "#8FA8C0", accent: "#8FA8C0" };

export function PokemonDetailsModal({ pokemon, visible, onClose }: Props) {
  if (!pokemon) return null;

  const mainType = pokemon.tipo;
  const palette = TYPE_COLORS[mainType] ?? DEFAULT_COLORS;

  const statsList = [
    { label: "HP", value: pokemon.stats.hp, max: 255, color: "#66BB6A" },
    { label: "Ataque", value: pokemon.stats.ataque, max: 190, color: "#FF6B35" },
    { label: "Defesa", value: pokemon.stats.defesa, max: 230, color: "#4FC3F7" },
    { label: "Atq. Esp.", value: pokemon.stats.ataqueEspecial, max: 194, color: "#AB47BC" },
    { label: "Def. Esp.", value: pokemon.stats.defesaEspecial, max: 230, color: "#5C6BC0" },
    { label: "Velocidade", value: pokemon.stats.velocidade, max: 180, color: "#FFD600" },
  ];

  const paddedId = String(pokemon.id).padStart(3, "0");

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Card */}
          <View style={[styles.headerCard, { backgroundColor: palette.accent }]}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.pokeId}>#{paddedId}</Text>
            </View>

            {/* Imagem Flutuante */}
            <View style={styles.imageContainer}>
              <Image
                source={pokemon.imagem}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Body Card */}
          <ScrollView
            style={styles.bodyCard}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Nome */}
            <Text style={styles.name}>{pokemon.nome}</Text>

            {/* Badges de Tipo */}
            <View style={styles.typesRow}>
              {pokemon.tipos?.map((t, idx) => {
                const typePalette = TYPE_COLORS[t] ?? DEFAULT_COLORS;
                return (
                  <View key={idx} style={[styles.typeBadge, { backgroundColor: typePalette.bg, borderColor: typePalette.accent }]}>
                    <Text style={[styles.typeText, { color: typePalette.text }]}>
                      {t.toUpperCase()}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Altura / Peso */}
            <View style={styles.measurementsRow}>
              <View style={styles.measureItem}>
                <Ionicons name="resize-outline" size={20} color="#8FA8C0" />
                <View style={styles.measureTexts}>
                  <Text style={styles.measureVal}>{pokemon.altura} m</Text>
                  <Text style={styles.measureLbl}>Altura</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.measureItem}>
                <Ionicons name="scale-outline" size={20} color="#8FA8C0" />
                <View style={styles.measureTexts}>
                  <Text style={styles.measureVal}>{pokemon.peso} kg</Text>
                  <Text style={styles.measureLbl}>Peso</Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Status Base</Text>

              {statsList.map((stat, idx) => {
                const percentage = Math.min((stat.value / stat.max) * 100, 100);
                return (
                  <View key={idx} style={styles.statRow}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: stat.color,
                            shadowColor: stat.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6, 12, 22, 0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: "#0D1B2A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerCard: {
    height: SCREEN_HEIGHT * 0.28,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
    position: "relative",
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  pokeId: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  imageContainer: {
    position: "absolute",
    bottom: -40,
    alignSelf: "center",
    zIndex: 20,
    // Sombra para a arte oficial
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: SCREEN_HEIGHT * 0.22,
    height: SCREEN_HEIGHT * 0.22,
  },
  bodyCard: {
    flex: 1,
    backgroundColor: "#0D1B2A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -16, // sobreposição elegante
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 64, // espaço para a imagem flutuante
    paddingBottom: 40,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 16,
  },
  typesRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  measurementsRow: {
    flexDirection: "row",
    backgroundColor: "#162234",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 28,
  },
  measureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  measureTexts: {
    justifyContent: "center",
  },
  measureVal: {
    color: "#F7F9FC",
    fontSize: 16,
    fontWeight: "700",
  },
  measureLbl: {
    color: "#8FA8C0",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statsSection: {
    gap: 16,
  },
  statsTitle: {
    color: "#F7F9FC",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    color: "#8FA8C0",
    fontSize: 13,
    fontWeight: "600",
    width: 80,
  },
  statValue: {
    color: "#F7F9FC",
    fontSize: 14,
    fontWeight: "800",
    width: 32,
    textAlign: "right",
    marginRight: 12,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    // Brilho neon sutil
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
