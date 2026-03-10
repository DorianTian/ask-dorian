import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import type { AuthScreenProps } from "../../navigation/types"
import { useAuth } from "../../providers/auth-provider"
import { useColors, spacing, typography, radii } from "../../theme"

export function RegisterScreen({ navigation }: AuthScreenProps<"Register">) {
  const colors = useColors()
  const register = useAuth((s) => s.register)
  const isLoading = useAuth((s) => s.isLoading)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) return
    if (password.length < 8) {
      Alert.alert("Password Too Short", "Password must be at least 8 characters.")
      return
    }
    const ok = await register(name.trim(), email.trim(), password)
    if (!ok) {
      Alert.alert("Registration Failed", "This email may already be in use.")
    }
  }

  const s = styles(colors)

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={s.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={s.logoArea}>
          <Text style={[s.brand, { color: colors.brandFrom }]}>
            Ask Dorian
          </Text>
          <Text style={[s.tagline, { color: colors.mutedForeground }]}>
            Create your account
          </Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <TextInput
            style={[s.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Name"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={[s.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Email"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[s.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Password (8+ characters)"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[s.button, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading || !name.trim() || !email.trim() || !password}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} size="small" />
            ) : (
              <Text style={[s.buttonText, { color: colors.primaryForeground }]}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={s.footer}
          onPress={() => navigation.goBack()}
        >
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.brandFrom, fontWeight: "600" }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1 },
    inner: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing["2xl"],
    },
    logoArea: {
      alignItems: "center",
      marginBottom: spacing["5xl"],
    },
    brand: {
      ...typography.h1,
      fontSize: 32,
      fontWeight: "800",
    },
    tagline: {
      ...typography.body,
      marginTop: spacing.xs,
    },
    form: {
      gap: spacing.md,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderRadius: radii.md,
      paddingHorizontal: spacing.lg,
      ...typography.body,
    },
    button: {
      height: 48,
      borderRadius: radii.md,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
    },
    buttonText: {
      ...typography.bodyMedium,
      fontWeight: "600",
    },
    footer: {
      alignItems: "center",
      marginTop: spacing["3xl"],
    },
    footerText: {
      ...typography.body,
    },
  })
