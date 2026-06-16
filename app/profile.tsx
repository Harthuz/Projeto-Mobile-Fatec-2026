import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { documentDirectory, copyAsync } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BottomNavigation } from "../components/BottomNavigation";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api.service";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1713194723780-29a0400e3d0b?q=80&w=300&300=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function Profile() {
  const { isLogged, userId, logout } = useAuth();

  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [level, setLevel] = useState(1);
  const [vitorias, setVitorias] = useState(0);
  const [derrotas, setDerrotas] = useState(0);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadProfileData() {
      if (!userId) return;
      try {
        const savedNome = await AsyncStorage.getItem("@profile_nome");
        const savedAvatar = await AsyncStorage.getItem("@profile_avatar");

        if (savedNome) setNome(savedNome);
        if (savedAvatar) setAvatarUri(savedAvatar);

        // Carrega dados dinâmicos da API
        const stats = await apiService.getStats(userId);
        if (stats) {
          setUsuario(stats.username || "");
          setLevel(stats.level ?? 1);
          setVitorias(stats.vitorias ?? 0);
          setDerrotas(stats.derrotas ?? 0);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do perfil via API:", err);
      }
    }
    loadProfileData();
  }, [userId]);

  if (!isLogged) {
    return <Redirect href="/" />;
  }

  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Precisamos de permissão de acesso à galeria para alterar a imagem de perfil!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const pickedUri = result.assets[0].uri;

        if (Platform.OS === "web") {
          setAvatarUri(pickedUri);
          await AsyncStorage.setItem("@profile_avatar", pickedUri);
        } else {
          const localFilename = "profile_avatar.jpg";
          const localDest = documentDirectory + localFilename;
          await copyAsync({ from: pickedUri, to: localDest });
          setAvatarUri(localDest);
          await AsyncStorage.setItem("@profile_avatar", localDest);
        }
      }
    } catch (err) {
      console.error("Erro ao selecionar imagem:", err);
      alert("Ocorreu um erro ao selecionar a imagem.");
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      await AsyncStorage.setItem("@profile_nome", nome);
      setSuccessMsg("Perfil salvo com sucesso!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  // Taxa de vitória calculada (vitórias / total de partidas)
  const totalPartidas = vitorias + derrotas;
  const winRate = totalPartidas > 0 ? Math.round((vitorias / totalPartidas) * 100) : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PERFIL DO TREINADOR</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarGlow}>
            <Image
              source={{ uri: avatarUri || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handleSelectImage}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.usernameHeader}>
            {usuario ? `@${usuario.toLowerCase()}` : "@treinador"}
          </Text>
        </View>

        {/* Dados do Treinador */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados do Treinador</Text>

          <Text style={styles.label}>NOME DO TREINADOR</Text>
          <Input
            placeholder="Seu nome completo"
            value={nome}
            onChangeText={setNome}
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>USUÁRIO / USERNAME</Text>
          <Input
            placeholder="Nome de usuário"
            value={usuario}
            editable={false} // Usuário vem da API/Login e não é editável diretamente
            autoCapitalize="none"
            autoCorrect={false}
            style={{ opacity: 0.6 }}
          />

          {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

          <Button
            title="Salvar Perfil"
            onPress={handleSaveProfile}
            isLoading={saving}
            style={{ marginTop: 24 }}
          />
        </View>

        {/* Painel de Estatísticas — somente leitura */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estatísticas de Batalha</Text>
          <Text style={styles.statsNote}>
            Os dados são atualizados automaticamente via API de batalha.
          </Text>

          {/* Grid de stats */}
          <View style={styles.statsGrid}>
            {/* Nível */}
            <View style={[styles.statBox, styles.statBoxPartidas]}>
              <Ionicons name="flash" size={22} color="#FFD600" style={styles.statIcon} />
              <Text style={[styles.statNumber, { color: "#FFD600" }]}>{level}</Text>
              <Text style={styles.statLabel}>Nível</Text>
            </View>

            {/* Vitórias */}
            <View style={[styles.statBox, styles.statBoxVitorias]}>
              <Ionicons name="trophy" size={22} color="#66BB6A" style={styles.statIcon} />
              <Text style={[styles.statNumber, { color: "#66BB6A" }]}>{vitorias}</Text>
              <Text style={styles.statLabel}>Vitórias</Text>
            </View>

            {/* Derrotas */}
            <View style={[styles.statBox, styles.statBoxDerrotas]}>
              <Ionicons name="skull" size={22} color="#E53935" style={styles.statIcon} />
              <Text style={[styles.statNumber, { color: "#E53935" }]}>{derrotas}</Text>
              <Text style={styles.statLabel}>Derrotas</Text>
            </View>
          </View>

          {/* Taxa de vitória */}
          {totalPartidas > 0 && (
            <View style={styles.winRateRow}>
              <Text style={styles.winRateLabel}>Taxa de Vitória</Text>
              <View style={styles.winRateBar}>
                <View style={[styles.winRateFill, { width: `${winRate}%` }]} />
              </View>
              <Text style={styles.winRatePercent}>{winRate}%</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavigation activeTab="profile" />
    </KeyboardAvoidingView>
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
    justifyContent: "space-between",
    backgroundColor: "#E53935",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#B71C1C",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#263850",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 28,
  },
  avatarGlow: {
    position: "relative",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#162234",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0D1B2A",
  },
  usernameHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8FA8C0",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  card: {
    width: "100%",
    backgroundColor: "#162234",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F7F9FC",
    letterSpacing: 0.5,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#E53935",
    paddingLeft: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8FA8C0",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  successText: {
    color: "#66BB6A",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },

  // Stats — somente leitura
  statsNote: {
    color: "#8FA8C0",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 20,
    fontStyle: "italic",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statBoxPartidas: {
    backgroundColor: "rgba(255,214,0,0.07)",
    borderColor: "rgba(255,214,0,0.2)",
  },
  statBoxVitorias: {
    backgroundColor: "rgba(102,187,106,0.07)",
    borderColor: "rgba(102,187,106,0.2)",
  },
  statBoxDerrotas: {
    backgroundColor: "rgba(229,57,53,0.07)",
    borderColor: "rgba(229,57,53,0.2)",
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statLabel: {
    color: "#8FA8C0",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  // Barra de taxa de vitória
  winRateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  winRateLabel: {
    color: "#8FA8C0",
    fontSize: 12,
    fontWeight: "600",
    width: 90,
  },
  winRateBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  winRateFill: {
    height: "100%",
    backgroundColor: "#66BB6A",
    borderRadius: 4,
  },
  winRatePercent: {
    color: "#66BB6A",
    fontSize: 13,
    fontWeight: "800",
    width: 38,
    textAlign: "right",
  },
});
