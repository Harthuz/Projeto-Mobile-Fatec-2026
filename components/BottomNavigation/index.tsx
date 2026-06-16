import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  Dimensions,
} from "react-native";
import { useRef, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Habilita animação de layout no Android se disponível
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = "pokemons" | "team" | "profile";

type Props = {
  activeTab: TabType;
  onTabPress?: (key: TabType) => void;
  scrollX?: Animated.Value;
};

export function BottomNavigation({ activeTab, onTabPress, scrollX }: Props) {
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

  // Configura um valor animado local caso scrollX não seja passado
  const localScrollX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!scrollX) {
      const targetIndex = activeTab === "pokemons" ? 0 : activeTab === "team" ? 1 : 2;
      Animated.timing(localScrollX, {
        toValue: targetIndex * SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [activeTab, scrollX]);

  const activeScrollX = scrollX || localScrollX;

  const BAR_WIDTH = SCREEN_WIDTH - 40;
  const TAB_WIDTH = BAR_WIDTH / 3;
  const INDICATOR_WIDTH = 24;
  const INDICATOR_LEFT = (TAB_WIDTH - INDICATOR_WIDTH) / 2;

  // Interpolação para mover a linha continuamente de acordo com o swipe
  const translateX = activeScrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
    outputRange: [0, TAB_WIDTH, TAB_WIDTH * 2],
    extrapolate: "clamp",
  });

  const handlePress = (route: string, key: TabType) => {
    if (activeTab === key) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (onTabPress) {
      onTabPress(key);
    } else {
      router.replace(route as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {/* Indicador animado que desliza junto com o swipe do dedo */}
        <Animated.View
          style={[
            styles.glowIndicator,
            {
              left: INDICATOR_LEFT,
              transform: [{ translateX }],
            },
          ]}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handlePress(tab.route, tab.key)}
              activeOpacity={0.7}
            >
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
    position: "relative",
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
    top: 0,
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
