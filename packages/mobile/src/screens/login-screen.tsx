import React, { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { BrainCircuit, Mail, Lock, User } from "lucide-react-native"
import { useColors } from "../theme"
import { useAuth } from "../providers/auth-provider"
import { GoogleLogo } from "../components/google-logo"

type Mode = "login" | "register"

// Web-only: access Google Identity Services via globalThis (no DOM types needed)
function getGoogleGIS(): { initialize: Function; renderButton: Function } | null {
  if (Platform.OS !== "web") return null
  const g = (globalThis as Record<string, unknown>).google as
    | { accounts: { id: { initialize: Function; renderButton: Function } } }
    | undefined
  return g?.accounts?.id ?? null
}

const GOOGLE_CLIENT_ID =
  Platform.OS === "web"
    ? (typeof import.meta !== "undefined" &&
        (import.meta as unknown as { env?: Record<string, string> }).env
          ?.VITE_GOOGLE_CLIENT_ID) || ""
    : ""

export function LoginScreen() {
  const colors = useColors()
  const login = useAuth((s) => s.login)
  const register = useAuth((s) => s.register)
  const googleOAuth = useAuth((s) => s.googleOAuth)
  const isLoading = useAuth((s) => s.isLoading)

  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // Google Sign-In (web only)
  const googleHiddenRef = useRef<View | null>(null)
  const [googleReady, setGoogleReady] = useState(false)

  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setError("")
      const success = await googleOAuth(response.credential)
      if (!success) {
        setError("Google sign-in failed. Please try again.")
      }
    },
    [googleOAuth],
  )

  useEffect(() => {
    if (Platform.OS !== "web" || !GOOGLE_CLIENT_ID) return

    // Wait for GIS script to load
    function check() {
      if (getGoogleGIS()) {
        setGoogleReady(true)
      } else {
        setTimeout(check, 200)
      }
    }
    check()
  }, [])

  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID) return
    const gis = getGoogleGIS()
    if (!gis) return

    gis.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    })

    // Render a hidden button that we programmatically click
    if (googleHiddenRef.current) {
      gis.renderButton(googleHiddenRef.current as unknown, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        width: "380",
      })
    }
  }, [googleReady, handleGoogleCallback])

  const handleGoogleSignIn = useCallback(() => {
    if (Platform.OS === "web" && googleHiddenRef.current) {
      // Trigger the hidden GIS button (web DOM access via type assertion)
      const el = googleHiddenRef.current as unknown as { querySelector: (s: string) => { click: () => void } | null }
      el.querySelector("div[role=button]")?.click()
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields")
      return
    }
    if (mode === "register" && !name.trim()) {
      setError("Name is required")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    let success: boolean
    if (mode === "login") {
      success = await login(email.trim(), password)
    } else {
      success = await register(name.trim(), email.trim(), password)
    }

    if (!success) {
      setError(
        mode === "login"
          ? "Invalid email or password"
          : "Registration failed. Email may already be in use.",
      )
    }
  }, [mode, name, email, password, login, register])

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"))
    setError("")
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Background glows */}
      <View style={[s.glowTop, { backgroundColor: colors.brandFrom }]} />
      <View style={[s.glowBottom, { backgroundColor: colors.brandFrom }]} />

      {/* Hidden Google Sign-In button (web only) */}
      {Platform.OS === "web" && GOOGLE_CLIENT_ID && (
        <View
          ref={googleHiddenRef}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none" } as never}
        />
      )}

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoArea}>
            <View style={[s.logoCircle, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "4D" }]}>
              <BrainCircuit size={40} color={colors.brandFrom} />
            </View>
            <Text style={[s.appName, { color: colors.foreground }]}>Ask Dorian</Text>
          </View>

          {/* Title */}
          <Text style={[s.title, { color: colors.foreground }]}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </Text>
          <Text style={[s.subtitle, { color: colors.textTertiary }]}>
            {mode === "login"
              ? "Sign in to continue to your workspace"
              : "Start organizing your fragments today"}
          </Text>

          {/* Google OAuth button */}
          <TouchableOpacity
            style={[s.googleButton, { borderColor: colors.border, backgroundColor: colors.card + "CC" }]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.7}
          >
            <GoogleLogo size={20} />
            <Text style={[s.googleButtonText, { color: colors.textPrimary }]}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[s.dividerText, { color: colors.textMuted }]}>or</Text>
            <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Email/Password Form */}
          <View style={s.form}>
            {mode === "register" && (
              <View style={s.inputRow}>
                <User size={18} color={colors.textMuted} style={s.inputIcon} />
                <TextInput
                  style={[s.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card + "CC" }]}
                  placeholder="Full name"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            )}

            <View style={s.inputRow}>
              <Mail size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card + "CC" }]}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={s.inputRow}>
              <Lock size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card + "CC" }]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </View>

            {error !== "" && (
              <Text style={[s.errorText, { color: colors.destructive }]}>{error}</Text>
            )}

            <TouchableOpacity
              style={[s.submitButton, { backgroundColor: colors.brandFrom, shadowColor: colors.brandFrom }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={s.submitText}>
                  {mode === "login" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle mode */}
          <View style={s.toggleRow}>
            <Text style={[s.toggleLabel, { color: colors.textTertiary }]}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
              <Text style={[s.toggleLink, { color: colors.brandFrom }]}>
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  glowTop: {
    position: "absolute",
    top: "-15%",
    right: "-10%",
    width: 256,
    height: 256,
    borderRadius: 128,
    opacity: 0.12,
  },
  glowBottom: {
    position: "absolute",
    bottom: "-10%",
    left: "-15%",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.06,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },

  // Logo
  logoArea: { alignItems: "center", marginBottom: 40 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 300,
  },

  // Google button
  googleButton: {
    width: "100%",
    maxWidth: 380,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 380,
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Form
  form: {
    width: "100%",
    maxWidth: 380,
    gap: 16,
  },
  inputRow: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 19,
    zIndex: 1,
  },
  input: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
  },
  submitButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  toggleLabel: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: "700",
  },
})
