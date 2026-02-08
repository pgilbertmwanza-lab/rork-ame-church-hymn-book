import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useMemo, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";

import { HYMNS, FREE_PREVIEW_COUNT } from "@/mocks/hymns";
import { FontSize } from "@/types/hymn";
import { trpc } from "@/lib/trpc";

import { useAuth } from "./auth-context";

type SubscriptionStatus = 'FREE' | 'PREMIUM';

export const [AppContext, useApp] = createContextHook(() => {
  const { user, deviceId } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('FREE');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<"english" | "bemba">("english");
  const [isLoadingAppState, setIsLoadingAppState] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAppState();
  }, [user]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && user) {
      console.log('[AppContext] App became active, refreshing subscription status...');
      await refreshSubscriptionStatus();
    }
  };

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

      if (user) {
        await refreshSubscriptionStatus();
      }
    } catch (error) {
      console.error("Failed to load app state:", error);
      setSubscriptionStatus('FREE');
    } finally {
      setIsLoadingAppState(false);
    }
  };

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) {
      console.log('[AppContext] No user, setting status to FREE');
      setSubscriptionStatus('FREE');
      return;
    }

    try {
      console.log('[AppContext] Fetching subscription status from backend...');
      const profile = await trpc.auth.getProfile.query();
      console.log('[AppContext] Backend subscription status:', profile.subscriptionStatus);
      
      setSubscriptionStatus(profile.subscriptionStatus);
      
      const authUser = JSON.parse(await AsyncStorage.getItem('auth_user') || '{}');
      authUser.subscriptionStatus = profile.subscriptionStatus;
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));
    } catch (error) {
      console.error('[AppContext] Failed to fetch subscription status:', error);
      setSubscriptionStatus('FREE');
    }
  }, [user]);

  const toggleFavorite = async (hymnId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(hymnId)) {
      newFavorites.delete(hymnId);
    } else {
      newFavorites.add(hymnId);
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify([...newFavorites]));
  };

  const updateFontSize = async (size: FontSize) => {
    console.log("Updating font size to:", size);
    setFontSize(size);
    await AsyncStorage.setItem("fontSize", size);
    console.log("Font size updated and saved to AsyncStorage");
  };

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem("isDarkMode", String(newValue));
  };

  const toggleLanguage = async () => {
    const newValue = language === "english" ? "bemba" : "english";
    setLanguage(newValue);
    await AsyncStorage.setItem("language", newValue);
  };

  const refreshAccess = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubscriptionStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  const availableHymns = useMemo(() => {
    if (subscriptionStatus === 'PREMIUM') {
      return HYMNS;
    }
    return HYMNS.slice(0, FREE_PREVIEW_COUNT);
  }, [subscriptionStatus]);

  const canAccessHymn = (hymnNumber: number) => {
    return subscriptionStatus === 'PREMIUM' || hymnNumber <= FREE_PREVIEW_COUNT;
  };

  const favoriteHymns = useMemo(() => {
    return HYMNS.filter((hymn) => favorites.has(hymn.id));
  }, [favorites]);

  return {
    subscriptionStatus,
    isPaid: subscriptionStatus === 'PREMIUM',
    favorites,
    fontSize,
    isDarkMode,
    language,
    isLoadingAppState,
    isRefreshing,
    deviceId,
    availableHymns,
    favoriteHymns,
    canAccessHymn,
    toggleFavorite,
    updateFontSize,
    toggleDarkMode,
    toggleLanguage,
    refreshAccess,
    refreshSubscriptionStatus,
  };
});
