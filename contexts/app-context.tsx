import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useMemo, useCallback } from "react";

import { HYMNS, FREE_PREVIEW_COUNT } from "@/mocks/hymns";
import { FontSize } from "@/types/hymn";

import { useAuth } from "./auth-context";

export const [AppContext, useApp] = createContextHook(() => {
  const { user, deviceId } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<"english" | "bemba">("english");
  const [isLoadingAppState, setIsLoadingAppState] = useState(true);

  const isMember = !!user;

  useEffect(() => {
    loadAppState();
  }, [user]);

  const loadAppState = async () => {
    try {
      const [favoritesStr, fontSizeStr, darkModeStr, languageStr] = await Promise.all([
        AsyncStorage.getItem("favorites"),
        AsyncStorage.getItem("fontSize"),
        AsyncStorage.getItem("isDarkMode"),
        AsyncStorage.getItem("language"),
      ]);

      if (favoritesStr) {
        setFavorites(new Set(JSON.parse(favoritesStr)));
      }
      if (fontSizeStr) {
        setFontSize(fontSizeStr as FontSize);
      }
      if (darkModeStr) {
        setIsDarkMode(darkModeStr === "true");
      }
      if (languageStr) {
        setLanguage(languageStr as "english" | "bemba");
      }
    } catch (error) {
      console.error("Failed to load app state:", error);
    } finally {
      setIsLoadingAppState(false);
    }
  };

  const toggleFavorite = useCallback(async (hymnId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(hymnId)) {
      newFavorites.delete(hymnId);
    } else {
      newFavorites.add(hymnId);
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify([...newFavorites]));
  }, [favorites]);

  const updateFontSize = useCallback(async (size: FontSize) => {
    console.log("Updating font size to:", size);
    setFontSize(size);
    await AsyncStorage.setItem("fontSize", size);
    console.log("Font size updated and saved to AsyncStorage");
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem("isDarkMode", String(newValue));
  }, [isDarkMode]);

  const toggleLanguage = useCallback(async () => {
    const newValue = language === "english" ? "bemba" : "english";
    setLanguage(newValue);
    await AsyncStorage.setItem("language", newValue);
  }, [language]);

  const availableHymns = useMemo(() => {
    if (isMember) {
      return HYMNS;
    }
    return HYMNS.slice(0, FREE_PREVIEW_COUNT);
  }, [isMember]);

  const canAccessHymn = useCallback((hymnNumber: number) => {
    return isMember || hymnNumber <= FREE_PREVIEW_COUNT;
  }, [isMember]);

  const favoriteHymns = useMemo(() => {
    return HYMNS.filter((hymn) => favorites.has(hymn.id));
  }, [favorites]);

  return {
    isMember,
    favorites,
    fontSize,
    isDarkMode,
    language,
    isLoadingAppState,
    deviceId,
    availableHymns,
    favoriteHymns,
    canAccessHymn,
    toggleFavorite,
    updateFontSize,
    toggleDarkMode,
    toggleLanguage,
  };
});
