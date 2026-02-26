import { Stack } from "expo-router";
import { BookOpen, ExternalLink } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";

export default function SignInScreen() {
  const { isDarkMode: isDark } = useApp();
  const { signIn, isSigningIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) return;
    await signIn(email, password);
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BookOpen size={48} color="#fff" />
            </View>
            <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
              AME Church Hymns
            </Text>
            <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]}>
              Sign in to access the full library
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                Email
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="your.email@example.com"
                placeholderTextColor={isDark ? "#666" : "#9CA3AF"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Enter your password"
                placeholderTextColor={isDark ? "#666" : "#9CA3AF"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isSigningIn && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, isDark ? styles.dividerDark : styles.dividerLight]} />
              <Text style={[styles.dividerText, isDark ? styles.subtextDark : styles.subtextLight]}>
                or
              </Text>
              <View style={[styles.dividerLine, isDark ? styles.dividerDark : styles.dividerLight]} />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                styles.createAccountButton,
                isDark ? styles.createAccountButtonDark : styles.createAccountButtonLight,
              ]}
              onPress={() => Linking.openURL("https://districtrayac.web.app/")}
            >
              <ExternalLink size={18} color={isDark ? "#fff" : "#212121"} />
              <Text style={[styles.createAccountText, isDark ? styles.textDark : styles.textLight]}>
                Create Account
              </Text>
            </TouchableOpacity>

            <Text style={[styles.helpText, isDark ? styles.subtextDark : styles.subtextLight]}>
              New members can create an account on our website. After registering, return here to sign in.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FAFAFA",
  },
  containerDark: {
    backgroundColor: "#0A0A0B",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E31B23",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  subtitleLight: {
    color: "#6B7280",
  },
  subtitleDark: {
    color: "#D1D5DB",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  labelLight: {
    color: "#212121",
  },
  labelDark: {
    color: "#fff",
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
    color: "#212121",
  },
  inputDark: {
    backgroundColor: "#151517",
    borderColor: "#2A2A2E",
    color: "#fff",
  },
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#E31B23",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  createAccountButton: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
  },
  createAccountButtonLight: {
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  createAccountButtonDark: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  createAccountText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLight: {
    backgroundColor: "#E5E7EB",
  },
  dividerDark: {
    backgroundColor: "#2A2A2E",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  helpText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 8,
  },
  textLight: {
    color: "#212121",
  },
  textDark: {
    color: "#fff",
  },
  subtextDark: {
    color: "#D1D5DB",
  },
  subtextLight: {
    color: "#6B7280",
  },
});
