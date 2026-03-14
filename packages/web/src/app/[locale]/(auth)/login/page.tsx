"use client"

import { useState, useEffect, useCallback, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/providers/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { Diamond, Github, Mail, ArrowRight, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import Script from "next/script"
import { useLocale } from "next-intl"

type Mode = "login" | "register"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

export default function LoginPage() {
  const t = useTranslations("login")
  const login = useAuth((s) => s.login)
  const register = useAuth((s) => s.register)
  const googleOAuth = useAuth((s) => s.googleOAuth)
  const isLoading = useAuth((s) => s.isLoading)

  const locale = useLocale()

  const [mode, setMode] = useState<Mode>("login")
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  function switchMode(newMode: Mode) {
    setMode(newMode)
    setShowEmailForm(false)
    setError("")
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (mode === "register") {
      if (password.length < 8) {
        setError(t("passwordTooShort"))
        return
      }
      if (password !== confirmPassword) {
        setError(t("passwordMismatch"))
        return
      }
      const success = await register(name, email, password)
      if (!success) {
        setError(t("registerError"))
      }
    } else {
      const success = await login(email, password)
      if (!success) {
        setError(t("loginError"))
      }
    }
  }

  // Google Identity Services callback
  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setError("")
      const success = await googleOAuth(response.credential)
      if (!success) {
        setError(t("loginError"))
      }
    },
    [googleOAuth, t],
  )

  const [googleReady, setGoogleReady] = useState(false)

  // Initialize Google Sign-In button once SDK is loaded
  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID || !window.google) return
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    })
    const el = document.getElementById("google-signin-btn")
    if (el) {
      window.google.accounts.id.renderButton(el, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        width: "400",
        text: "continue_with",
        shape: "pill",
      })
    }
  }, [googleReady, handleGoogleCallback])

  const isRegister = mode === "register"

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-8 relative overflow-hidden">
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <ArrowRight size={16} className="rotate-180" /> {t("back")}
          </Link>
          <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 mx-auto">
            <Diamond size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            {isRegister ? t("welcomeRegister") : t("welcome")}
          </h2>
          <p className="text-slate-500">
            {isRegister ? t("subtitleRegister") : t("subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-dark rounded-xl p-1 border border-white/5">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              !isRegister
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {t("tabLogin")}
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              isRegister
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {t("tabRegister")}
          </button>
        </div>

        {/* Form Area */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.button
                key="email-button"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                {isRegister ? <UserPlus size={20} /> : <Mail size={20} />}
                {t("continueEmail")}
              </motion.button>
            ) : (
              <motion.form
                key={`form-${mode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                {isRegister && (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("name")}
                    className="w-full bg-surface-dark border border-white/10 text-white px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                  />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email")}
                  className="w-full bg-surface-dark border border-white/10 text-white px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password")}
                  className="w-full bg-surface-dark border border-white/10 text-white px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                />
                {isRegister && (
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("confirmPassword")}
                    className="w-full bg-surface-dark border border-white/10 text-white px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                  />
                )}
                {error && (
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {isRegister ? <UserPlus size={20} /> : <Mail size={20} />}
                      {isRegister ? t("registerAction") : t("loginAction")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false)
                    setError("")
                  }}
                  className="w-full text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors py-2"
                >
                  {t("back")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider + OAuth */}
          {(GOOGLE_CLIENT_ID || GITHUB_CLIENT_ID) && (
            <>
              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {t("divider")}
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Hidden Google rendered button (needed for GIS SDK) */}
              {GOOGLE_CLIENT_ID && (
                <div id="google-signin-btn" className="absolute invisible pointer-events-none" />
              )}

              <div className="grid grid-cols-2 gap-4">
                {GITHUB_CLIENT_ID && (
                  <button
                    type="button"
                    onClick={() => {
                      const redirectUri = `${window.location.origin}/${locale}/callback/github`
                      window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
                    }}
                    className="bg-surface-dark border border-white/5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-sm font-bold text-white"
                  >
                    <Github size={18} /> {t("github")}
                  </button>
                )}
                {GOOGLE_CLIENT_ID && (
                  <button
                    type="button"
                    onClick={() => {
                      const hidden = document.querySelector<HTMLElement>("#google-signin-btn div[role=button]")
                      hidden?.click()
                    }}
                    className="bg-surface-dark border border-white/5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-sm font-bold text-white"
                  >
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {t("google")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Legal */}
        <p className="text-center text-xs text-slate-600">
          {t("agreement")}
          <br />
          <a href="#" className="text-primary hover:underline">
            {t("termsOfService")}
          </a>{" "}
          {t("and")}{" "}
          <a href="#" className="text-primary hover:underline">
            {t("privacyPolicy")}
          </a>
          .
        </p>
      </motion.div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
    </div>
  )
}
