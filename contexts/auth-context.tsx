import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { trpc } from "@/lib/trpc";

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  subscriptionStatus: 'FREE' | 'PREMIUM';
}

interface StoredUser {
  email: string;
  password: string;
  displayName: string;
  userId: string;
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
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem("auth_user"),
        AsyncStorage.getItem("auth_token"),
      ]);
      
      if (storedUser && storedToken) {
        global.authToken = storedToken;
        setUser(JSON.parse(storedUser));
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
    global.authToken = undefined;
    await Promise.all([
      AsyncStorage.removeItem("auth_user"),
      AsyncStorage.removeItem("auth_token"),
    ]);
    router.replace("/sign-in");
  };

  const signIn = async (email: string, password: string) => {
    setIsSigningIn(true);
    try {
      const result = await trpc.auth.signIn.mutate({ email, password });
      
      const token = `${result.userId}:${email}`;
      global.authToken = token;
      await AsyncStorage.setItem("auth_token", token);
      
      const profile = await trpc.auth.getProfile.query();
      
      const authUser: AuthUser = {
        userId: result.userId,
        email: result.email,
        displayName: result.displayName,
        subscriptionStatus: profile.subscriptionStatus,
      };
      
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error: any) {
      console.error('[Auth] Sign in failed:', error);
      Alert.alert("Error", error?.message || "Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsSigningUp(true);
    try {
      const result = await trpc.auth.signUp.mutate({ email, password, displayName });
      
      const token = `${result.userId}:${email}`;
      global.authToken = token;
      await AsyncStorage.setItem("auth_token", token);
      
      const authUser: AuthUser = {
        userId: result.userId,
        email: result.email,
        displayName: result.displayName,
        subscriptionStatus: 'FREE',
      };
      
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error: any) {
      console.error('[Auth] Sign up failed:', error);
      Alert.alert("Error", error?.message || "Failed to create account. Please try again.");
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
