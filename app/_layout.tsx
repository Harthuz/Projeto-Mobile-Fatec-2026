import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  AuthProvider,
} from "../context/AuthContext";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}