import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
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

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1713194723780-29a0400e3d0b?q=80&w=300&300=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function Profile() {
  const { isLogged, logout } = useAuth();

  // Estados de dados do Treinador
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Estados de estatísticas
  const [partidas, setPartidas] = useState(0);
  const [vitorias, setVitorias] = useState(0);
  const [derrotas, setDerrotas] = useState(0);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Carrega as informações salvas no AsyncStorage
  useEffect(() => {
    async function loadProfileData() {
      try {
        const savedNome = await AsyncStorage.getItem("@profile_nome");
        const savedUsuario = await AsyncStorage.getItem("@profile_username");
        const savedAvatar = await AsyncStorage.getItem("@profile_avatar");

        const savedPartidas = await AsyncStorage.getItem("@profile_partidas");
        const savedVitorias = await AsyncStorage.getItem("@profile_vitorias");
        const savedDerrotas = await AsyncStorage.getItem("@profile_derrotas");

        if (savedNome) setNome(savedNome);
        if (savedUsuario) setUsuario(savedUsuario);
        if (savedAvatar) setAvatarUri(savedAvatar);

        if (savedPartidas) setPartidas(Number(savedPartidas));
        if (savedVitorias) setVitorias(Number(savedVitorias));
        if (savedDerrotas) setDerrotas(Number(savedDerrotas));
      } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
      }
    }

    loadProfileData();
  }, []);

  if (!isLogged) {
    return <Redirect href="/" />;
  }

  // Função para abrir a galeria e escolher imagem
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
          // No ambiente Web salvamos o URI temporário diretamente
          setAvatarUri(pickedUri);
          await AsyncStorage.setItem("@profile_avatar", pickedUri);
        } else {
          // No ambiente Native, copiamos a imagem para a estrutura local de arquivos
          const localFilename = "profile_avatar.jpg";
          const localDest = FileSystem.documentDirectory + localFilename;

          await FileSystem.copyAsync({
            from: pickedUri,
            to: localDest,
          });

          setAvatarUri(localDest);
          await AsyncStorage.setItem("@profile_avatar", localDest);
        }
      }
    } catch (err) {
      console.error("Erro ao selecionar imagem:", err);
      alert("Ocorreu um erro ao selecionar a imagem.");
    }
  };

  // Salva Nome e Usuário no AsyncStorage
  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      await AsyncStorage.setItem("@profile_nome", nome);
      await AsyncStorage.setItem("@profile_username", usuario);

      setSuccessMsg("Perfil salvo com sucesso!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  // Funções utilitárias para estatísticas com salvamento automático
  const updateStat = async (type: "partidas" | "vitorias" | "derrotas", value: number) => {
    const newValue = Math.max(0, value);
    if (type === "partidas") {
      setPartidas(newValue);
      await AsyncStorage.setItem("@profile_partidas", String(newValue));
    } else if (type === "vitorias") {
      setVitorias(newValue);
      await AsyncStorage.setItem("@profile_vitorias", String(newValue));
    } else if (type === "derrotas") {
      setDerrotas(newValue);
      await AsyncStorage.setItem("@profile_derrotas", String(newValue));
    }
  };

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
        {/* Bloco do Avatar */}
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

        {/* Informações Cadastrais */}
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
            onChangeText={setUsuario}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

          <Button
            title="Salvar Perfil"
            onPress={handleSaveProfile}
            isLoading={saving}
            style={{ marginTop: 24 }}
          />
        </View>

        {/* Painel de Estatísticas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estatísticas de Batalha</Text>

          {/* Partidas */}
          <View style={styles.statControlRow}>
            <View>
              <Text style={styles.statName}>Partidas Totais</Text>
              <Text style={styles.statSub}>Total de duelos realizados</Text>
            </View>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => updateStat("partidas", partidas - 1)}
              >
                <Ionicons name="remove" size={18} color="#8FA8C0" />
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: "#FFD600" }]}>{partidas}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => updateStat("partidas", partidas + 1)}
              >
                <Ionicons name="add" size={18} color="#FFD600" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Vitórias */}
          <View style={styles.statControlRow}>
            <View>
              <Text style={styles.statName}>Vitórias</Text>
              <Text style={styles.statSub}>Combates vitoriosos</Text>
            </View>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => updateStat("vitorias", vitorias - 1)}
              >
                <Ionicons name="remove" size={18} color="#8FA8C0" />
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: "#66BB6A" }]}>{vitorias}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => updateStat("vitorias", vitorias + 1)}
              >
                <Ionicons name="add" size={18} color="#66BB6A" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Derrotas */}
          <View style={styles.statControlRow}>
            <View>
              <Text style={styles.statName}>Derrotas</Text>
              <Text style={styles.statSub}>Combates perdidos</Text>
            </View>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => updateStat("derrotas", derrotas - 1)}
              >
                <Ionicons name="remove" size={18} color="#8FA8C0" />
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: "#E53935" }]}>{derrotas}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => updateStat("derrotas", derrotas + 1)}
              >
                <Ionicons name="add" size={18} color="#E53935" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navegação Inferior */}
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
    paddingBottom: 120, // espaço para navegação inferior
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
    marginBottom: 20,
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

  // Controles de Estatísticas
  statControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  statName: {
    color: "#F7F9FC",
    fontSize: 15,
    fontWeight: "700",
  },
  statSub: {
    color: "#8FA8C0",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  counterControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 4,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#263850",
    alignItems: "center",
    justifyContent: "center",
  },
  counterVal: {
    fontSize: 18,
    fontWeight: "800",
    width: 44,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 14,
  },
});
