import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type Props = {
  nome: string;
  tipo: string;
  imagem: any;
  onPress?: () => void;
};

const TYPE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  Elétrico: { bg: "rgba(255,214,0,0.12)",   text: "#FFD600", accent: "#FFD600" },
  Fogo:     { bg: "rgba(255,107,53,0.12)",  text: "#FF6B35", accent: "#FF6B35" },
  Água:     { bg: "rgba(79,195,247,0.12)",  text: "#4FC3F7", accent: "#4FC3F7" },
  Planta:   { bg: "rgba(102,187,106,0.12)", text: "#66BB6A", accent: "#66BB6A" },
  Fantasma: { bg: "rgba(171,71,188,0.12)",  text: "#AB47BC", accent: "#AB47BC" },
  Normal:   { bg: "rgba(168,168,168,0.12)", text: "#A8A8A8", accent: "#A8A8A8" },
  Psíquico: { bg: "rgba(240,98,146,0.12)",  text: "#F06292", accent: "#F06292" },
  Pedra:    { bg: "rgba(161,136,127,0.12)", text: "#A1887F", accent: "#A1887F" },
  Lutador:  { bg: "rgba(255,138,101,0.12)", text: "#FF8A65", accent: "#FF8A65" },
  Venenoso: { bg: "rgba(186,104,200,0.12)", text: "#BA68C8", accent: "#BA68C8" },
  Terra:    { bg: "rgba(215,160,110,0.12)", text: "#D7A06E", accent: "#D7A06E" },
  Voador:   { bg: "rgba(144,202,249,0.12)", text: "#90CAF9", accent: "#90CAF9" },
  Inseto:   { bg: "rgba(156,204,101,0.12)", text: "#9CCC65", accent: "#9CCC65" },
  Dragão:   { bg: "rgba(92,107,192,0.12)",  text: "#5C6BC0", accent: "#5C6BC0" },
  Sombrio:  { bg: "rgba(110,110,110,0.12)", text: "#8E8E8E", accent: "#8E8E8E" },
  Aço:      { bg: "rgba(144,164,174,0.12)", text: "#90A4AE", accent: "#90A4AE" },
  Fada:     { bg: "rgba(244,143,177,0.12)", text: "#F48FB1", accent: "#F48FB1" },
  Gelo:     { bg: "rgba(128,222,234,0.12)", text: "#80DEEA", accent: "#80DEEA" },
};

const DEFAULT_COLORS = { bg: "rgba(255,255,255,0.06)", text: "#8FA8C0", accent: "#8FA8C0" };

export function PokemonCard({ nome, tipo, imagem, onPress }: Props) {
  const palette = TYPE_COLORS[tipo] ?? DEFAULT_COLORS;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Barra de cor do tipo */}
      <View style={[styles.accentBar, { backgroundColor: palette.accent }]} />

      {/* Imagem */}
      <View style={[styles.imageWrap, { backgroundColor: palette.bg }]}>
        <Image
          source={imagem}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={styles.nome}>{nome}</Text>

        <View style={[styles.typePill, { backgroundColor: palette.bg }]}>
          <Text style={[styles.typeText, { color: palette.text }]}>
            {tipo}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#162234",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    // sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  imageWrap: {
    width: 80,
    height: 80,
    margin: 12,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 64,
    height: 64,
  },
  info: {
    flex: 1,
    paddingRight: 16,
    gap: 8,
  },
  nome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F7F9FC",
    letterSpacing: 0.3,
  },
  typePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});