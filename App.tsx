import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, ThemeName } from "./src/styles/theme";
import { MainMenuScreen } from "./src/screens/MainMenuScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SkinsScreen, AVAILABLE_SKINS } from "./src/screens/SkinsScreen";
import { GameScreen } from "./src/screens/GameScreen";
import { GameMode } from "./src/game/useGameEngine";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<"MENU" | "GAME" | "SETTINGS" | "SKINS">("MENU");

  // Global settings states
  const [themeName, setThemeName] = useState<ThemeName>("NEO_NOIR");
  const [activeMode, setActiveMode] = useState<GameMode>("CLASSIC");
  const [activeSkinId, setActiveSkinId] = useState<string>("default");
  const [controlType, setControlType] = useState<"SWIPE" | "DPAD" | "BOTH">("BOTH");
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("@snake_selected_theme");
        const storedSkin = await AsyncStorage.getItem("@snake_selected_skin");
        const storedControl = await AsyncStorage.getItem("@snake_control_type");
        const storedHaptics = await AsyncStorage.getItem("@snake_haptics_enabled");
        const storedSound = await AsyncStorage.getItem("@snake_sound_enabled");

        if (storedTheme) setThemeName(storedTheme as ThemeName);
        if (storedSkin) setActiveSkinId(storedSkin);
        if (storedControl) setControlType(storedControl as "SWIPE" | "DPAD" | "BOTH");
        if (storedHaptics !== null) setHapticsEnabled(storedHaptics === "true");
        if (storedSound !== null) setSoundEnabled(storedSound === "true");
      } catch (err) {
        console.warn("Failed to load user settings preferences from AsyncStorage", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Setters with persistent writebacks
  const handleThemeChange = async (newTheme: ThemeName) => {
    setThemeName(newTheme);
    try {
      await AsyncStorage.setItem("@snake_selected_theme", newTheme);
    } catch (e) {
      console.warn("Failed saving theme configuration", e);
    }
  };

  const handleSkinSelect = async (skinId: string) => {
    setActiveSkinId(skinId);
    try {
      await AsyncStorage.setItem("@snake_selected_skin", skinId);
    } catch (e) {
      console.warn("Failed saving skin configuration", e);
    }
  };

  const handleControlTypeChange = async (type: "SWIPE" | "DPAD" | "BOTH") => {
    setControlType(type);
    try {
      await AsyncStorage.setItem("@snake_control_type", type);
    } catch (e) {
      console.warn("Failed saving controls configuration", e);
    }
  };

  const handleHapticsToggle = async (val: boolean) => {
    setHapticsEnabled(val);
    try {
      await AsyncStorage.setItem("@snake_haptics_enabled", val.toString());
    } catch (e) {
      console.warn("Failed saving haptics preference", e);
    }
  };

  const handleSoundToggle = async (val: boolean) => {
    setSoundEnabled(val);
    try {
      await AsyncStorage.setItem("@snake_sound_enabled", val.toString());
    } catch (e) {
      console.warn("Failed saving sound preference", e);
    }
  };

  // Get colors object based on selected theme name
  const colors = THEMES[themeName].colors;

  // Resolve custom skin colors (if selected)
  const selectedSkin = AVAILABLE_SKINS.find((s) => s.id === activeSkinId);
  const skinColors =
    selectedSkin && selectedSkin.id !== "default"
      ? { head: selectedSkin.headColor, body: selectedSkin.bodyColor }
      : undefined;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: "#08080C" }]}>
        <ActivityIndicator size="large" color="#00FF66" />
      </View>
    );
  }

  // Render active screen state
  const renderScreen = () => {
    switch (currentScreen) {
      case "MENU":
        return (
          <MainMenuScreen
            colors={colors}
            themeName={themeName}
            onPlay={(mode) => {
              setActiveMode(mode);
              setCurrentScreen("GAME");
            }}
            onNavigateToSettings={() => setCurrentScreen("SETTINGS")}
            onNavigateToSkins={() => setCurrentScreen("SKINS")}
          />
        );
      case "SETTINGS":
        return (
          <SettingsScreen
            colors={colors}
            themeName={themeName}
            onThemeChange={handleThemeChange}
            controlType={controlType}
            onControlTypeChange={handleControlTypeChange}
            hapticsEnabled={hapticsEnabled}
            onHapticsToggle={handleHapticsToggle}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            onBack={() => setCurrentScreen("MENU")}
          />
        );
      case "SKINS":
        return (
          <SkinsScreen
            colors={colors}
            activeSkinId={activeSkinId}
            onSkinSelect={handleSkinSelect}
            onBack={() => setCurrentScreen("MENU")}
          />
        );
      case "GAME":
        return (
          <GameScreen
            colors={colors}
            mode={activeMode}
            controlType={controlType}
            hapticsEnabled={hapticsEnabled}
            soundEnabled={soundEnabled}
            activeSkinColors={skinColors}
            onExit={() => setCurrentScreen("MENU")}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
