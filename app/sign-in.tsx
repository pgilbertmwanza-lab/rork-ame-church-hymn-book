import { Stack, router } from "expo-router";
import { BookOpen, ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useState, useRef } from "react";
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
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";

type AuthMode = "signIn" | "signUp";

export default function SignInScreen() {
  const { isDarkMode: isDark } = useApp();
  const { signIn, signUp, isSigningIn } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode: AuthMode) => {
    Animated.timing(slideAnim, {
      toValue: newMode === "signUp" ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setMode(newMode);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    await signIn(email.trim(), password);
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) return;
    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure both passwords are the same.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters.");
      return;
    }
    await signUp(email.trim(), password, displayName.trim());
  };

  const tabIndicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={isDark ? colors.dark.text : colors.light.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BookOpen size={36} color="#fff" />
            </View>
            <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
              AME Church Hymns
            </Text>
            <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]}>
              {mode === "signIn"
                ? "Welcome back! Sign in to access the full library."
                : "Create your account to unlock all hymns."}
            </Text>
          </View>

          <View style={[styles.tabContainer, isDark ? styles.tabContainerDark : styles.tabContainerLight]}>
            <Animated.View
              style={[
                styles.tabIndicator,
                { left: tabIndicatorLeft },
              ]}
            />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => switchMode("signIn")}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signIn" ? styles.tabTextActive : (isDark ? styles.tabTextInactiveDark : styles.tabTextInactive),
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => switchMode("signUp")}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signUp" ? styles.tabTextActive : (isDark ? styles.tabTextInactiveDark : styles.tabTextInactive),
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {mode === "signUp" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                  Full Name
                </Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="John Doe"
                  placeholderTextColor={isDark ? "#555" : "#9CA3AF"}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  autoComplete="name"
                  testID="name-input"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                Email
              </Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                placeholder="your.email@example.com"
                placeholderTextColor={isDark ? "#555" : "#9CA3AF"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                testID="email-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder={mode === "signUp" ? "Min. 6 characters" : "Enter your password"}
                  placeholderTextColor={isDark ? "#555" : "#9CA3AF"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  testID="password-input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={isDark ? "#666" : "#9CA3AF"} />
                  ) : (
                    <Eye size={20} color={isDark ? "#666" : "#9CA3AF"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {mode === "signUp" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                  Confirm Password
                </Text>
                <TextInput
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={isDark ? "#555" : "#9CA3AF"}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  testID="confirm-password-input"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, isSigningIn && styles.buttonDisabled]}
              onPress={mode === "signIn" ? handleSignIn : handleSignUp}
              disabled={isSigningIn}
              testID="submit-button"
            >
              {isSigningIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === "signIn" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.footerHint, isDark ? styles.subtextDark : styles.subtextLight]}>
              {mode === "signIn"
                ? "Don't have an account? Tap \"Create Account\" above."
                : "Already have an account? Tap \"Sign In\" above."}
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
    backgroundColor: "#1a1a1a",
  },
  topBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.churchBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  subtitleLight: {
    color: "#6B7280",
  },
  subtitleDark: {
    color: "#aaa",
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  tabContainerLight: {
    backgroundColor: "#E8EDF2",
  },
  tabContainerDark: {
    backgroundColor: "#2a2a2a",
  },
  tabIndicator: {
    position: "absolute" as const,
    top: 4,
    bottom: 4,
    width: "50%",
    backgroundColor: colors.churchBlue,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  tabTextActive: {
    color: "#fff",
  },
  tabTextInactive: {
    color: "#6B7280",
  },
  tabTextInactiveDark: {
    color: "#888",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputGroup: {
    marginBottom: 18,
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
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
    color: "#fff",
  },
  passwordContainer: {
    position: "relative" as const,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute" as const,
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.churchBlue,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  footerHint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 19,
  },
  textLight: {
    color: "#212121",
  },
  textDark: {
    color: "#fff",
  },
  subtextDark: {
    color: "#aaa",
  },
  subtextLight: {
    color: "#6B7280",
  },
});
