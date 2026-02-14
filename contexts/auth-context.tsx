import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { trpc } from "@/lib/trpc";

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  token: string;
}

const SECURE_TOKEN_KEY = "auth_token";

async function saveToken(token: string) {
  if (Platform.OS === "web") {
    global.authToken = token;
    await AsyncStorage.setItem(SECURE_TOKEN_KEY, token);
  } else {
    global.authToken = token;
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
  }
}

async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return await AsyncStorage.getItem(SECURE_TOKEN_KEY);
  } else {
    return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
  }
}

async function deleteToken() {
  global.authToken = undefined;
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(SECURE_TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
  }
}

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    loadAuth();
    loadOrCreateDeviceId();
  }, []);

  const loadAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        global.authToken = token;
        const stored = await AsyncStorage.getItem("auth_user");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrCreateDeviceId = async () => {
    try {
      let id = await AsyncStorage.getItem("device_id");
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem("device_id", id);
      }
      setDeviceId(id);
    } catch (error) {
      console.error("Failed to load device ID:", error);
    }
  };

  const signOut = async () => {
    setUser(null);
    await deleteToken();
    await AsyncStorage.removeItem("auth_user");
    router.replace("/sign-in");
  };

  const signInMutation = trpc.auth.signIn.useMutation();

  const signIn = async (email: string, password: string) => {
    setIsSigningIn(true);
    try {
      const result = await signInMutation.mutateAsync({ email, password });
      
      const authUser: AuthUser = {
        userId: result.userId,
        email: result.email,
        displayName: result.displayName,
        token: result.token,
      };
      
      await saveToken(result.token);
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error: any) {
      console.error('[Auth] Sign in failed:', error);
      Alert.alert("Error", error.message || "Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const signUpMutation = trpc.auth.signUp.useMutation();

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsSigningUp(true);
    try {
      const result = await signUpMutation.mutateAsync({ email, password, displayName });
      
      const authUser: AuthUser = {
        userId: result.userId,
        email: result.email,
        displayName: result.displayName,
        token: result.token,
      };
      
      await saveToken(result.token);
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error: any) {
      console.error('[Auth] Sign up failed:', error);
      Alert.alert("Error", error.message || "Failed to create account. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const signInWithGoogle = async () => {
    Alert.alert(
      "Google Sign-In",
      "Google authentication is available. To enable it, you'll need to configure OAuth credentials in the Google Cloud Console. For now, please use email and password to sign in.",
      [{ text: "OK" }]
    );
  };

  return {
    user,
    isLoading,
    deviceId,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isSigningIn,
    isSigningUp,
  };
});
