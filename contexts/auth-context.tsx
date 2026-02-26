import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
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

  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    loadAuth();
    loadOrCreateDeviceId();
  }, []);

  const loadAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem("auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
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

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsSigningIn(true);
    try {
      const usersData = await AsyncStorage.getItem("users_db");
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        Alert.alert("Account Exists", "An account with this email already exists. Please sign in instead.");
        return;
      }

      const userId = Crypto.randomUUID();
      const newUser: StoredUser = { email, password, displayName, userId };
      users.push(newUser);
      await AsyncStorage.setItem("users_db", JSON.stringify(users));

      const authUser: AuthUser = { userId, email, displayName };
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error) {
      console.error('[Auth] Sign up failed:', error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem("auth_user");
    router.replace("/");
  };

  const signIn = async (email: string, password: string) => {
    setIsSigningIn(true);
    try {
      const usersData = await AsyncStorage.getItem("users_db");
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        Alert.alert("Error", "No account found with this email. Please sign up first.");
        return;
      }
      
      if (foundUser.password !== password) {
        Alert.alert("Error", "Incorrect password. Please try again.");
        return;
      }
      
      const authUser: AuthUser = {
        userId: foundUser.userId,
        email: foundUser.email,
        displayName: foundUser.displayName,
      };
      
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error) {
      console.error('[Auth] Sign in failed:', error);
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };



  return {
    user,
    isLoading,
    deviceId,
    signIn,
    signUp,
    signOut,
    isSigningIn,
  };
});
