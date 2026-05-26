import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TabType = "pokemons" | "team" | "profile";

type Props = {
  activeTab: TabType;
};

export function BottomNavigation({ activeTab }: Props) {
  const tabs = [
    {
      key: "pokemons" as TabType,
      label: "Pokédex",
      iconActive: "book" as const,
      iconInactive: "book-outline" as const,
      route: "/pokemons",
    },
    {
      key: "team" as TabType,
      label: "Meu Time",
      iconActive: "people" as const,
      iconInactive: "people-outline" as const,
      route: "/team",
    },
    {
      key: "profile" as TabType,
      label: "Perfil",
      iconActive: "person" as const,
      iconInactive: "person-outline" as const,
      route: "/profile",
    },
  ];

  const handlePress = (route: string, key: TabType) => {
    if (activeTab === key) return;
    router.replace(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handlePress(tab.route, tab.key)}
              activeOpacity={0.7}
            >
              {/* Pokéball Glow Indicator */}
              {isActive && <View style={styles.glowIndicator} />}

              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={22}
                color={isActive ? "#FFD600" : "#8FA8C0"}
                style={isActive && styles.activeIcon}
              />
              <Text style={[styles.tabLabel, isActive ? styles.labelActive : styles.labelInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 28 : 16,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  navBar: {
    flexDirection: "row",
    backgroundColor: "rgba(22, 34, 52, 0.95)",
    borderRadius: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "space-around",
    alignItems: "center",
    // Sombra premium
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 4,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  glowIndicator: {
    position: "absolute",
    top: -12,
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E53935",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
  activeIcon: {
    textShadowColor: "rgba(255, 214, 0, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: "#F7F9FC",
  },
  labelInactive: {
    color: "#8FA8C0",
    opacity: 0.8,
  },
});
