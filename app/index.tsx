import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";

import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alerts";

export default function Login() {
  const { login, register, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  function showAlert(
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) {
    setAlertData({ title, message, type });
    setAlertVisible(true);
  }

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) {
      showAlert("Campos obrigatórios", "Preencha usuário e senha para continuar.", "warning");
      return;
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await register(username.trim(), password);
        showAlert("Sucesso!", "Conta criada com sucesso! Realizando login...", "success");
        
        // Auto-login após registrar
        setTimeout(async () => {
          try {
            await login(username.trim(), password);
            router.replace("/pokemons");
          } catch {
            setIsRegisterMode(false);
            showAlert("Entrar", "Conta criada. Insira suas credenciais para entrar.", "info");
          }
        }, 1200);
      } else {
        await login(username.trim(), password);
        showAlert("Bem-vindo, Treinador!", "Pokédex carregada com sucesso.", "success");

        setTimeout(() => {
          router.replace("/pokemons");
        }, 800);
      }
    } catch (err: any) {
      showAlert(
        "Erro",
        err.message || "Não foi possível concluir a ação. Verifique suas credenciais.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Pokéball decorativa ── */}
        <View style={styles.pokeballWrapper}>
          <View style={styles.pokeball}>
            <View style={styles.pokeballTop} />
            <View style={styles.pokeballStripe} />
            <View style={styles.pokeballBottom} />
            <View style={styles.pokeballButton} />
          </View>
        </View>

        {/* ── Título ── */}
        <Text style={styles.title}>POKÉDEX</Text>
        <Text style={styles.subtitle}>
          {isRegisterMode ? "Crie sua conta de Treinador" : "Faça login para acessar"}
        </Text>

        {/* ── Card de formulário ── */}
        <View style={styles.card}>
          <Text style={styles.label}>USUÁRIO / USERNAME</Text>
          <Input
            placeholder="Ex: kleber"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>SENHA</Text>
          <Input
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <Button
            title={isRegisterMode ? "Criar Conta" : "Entrar"}
            onPress={handleSubmit}
            isLoading={isLoading}
          />
        </View>

        <TouchableOpacity
          onPress={() => setIsRegisterMode(!isRegisterMode)}
          style={{ padding: 10 }}
        >
          <Text style={styles.hint}>
            {isRegisterMode
              ? "Já possui uma conta? Faça login aqui"
              : "Não tem uma conta? Cadastre-se aqui"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Alert multiplataforma ── */}
      <Alert
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const colors = {
  navy:    "#0D1B2A",
  navyMid: "#162234",
  red:     "#E53935",
  redDark: "#B71C1C",
  yellow:  "#FFD600",
  muted:   "#8FA8C0",
  border:  "rgba(255,255,255,0.08)",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    letterSpacing: 1,
  },

  // Pokéball
  pokeballWrapper: {
    marginBottom: 28,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  pokeball: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
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
    backgroundColor: colors.red,
  },
  pokeballStripe: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: "#111",
    marginTop: -3.5,
  },
  pokeballBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#EFEFEF",
  },
  pokeballButton: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "#111",
    top: "50%",
    left: "50%",
    marginTop: -14,
    marginLeft: -14,
  },

  // Texto
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.yellow,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: colors.redDark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 36,
    letterSpacing: 0.5,
  },

  // Card
  card: {
    width: "100%",
    backgroundColor: colors.navyMid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  hint: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    opacity: 0.7,
  },
});