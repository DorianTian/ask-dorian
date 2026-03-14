"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/providers/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Bell,
  Shield,
  Zap,
  Globe,
  LogOut,
  ChevronRight,
  Smartphone,
  Database,
  Image as ImageIcon,
  Sliders,
  X,
  Camera,
  type LucideIcon,
} from "lucide-react"

function SettingItem({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-none hover:bg-white/5 cursor-pointer transition-colors group">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-text-main">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ChevronRight
        size={18}
        className="text-slate-600 group-hover:text-text-main transition-colors"
      />
    </div>
  )
}

export default function SettingsPage() {
  const t = useTranslations("settings")
  const logout = useAuth((s) => s.logout)
  const user = useAuth((s) => s.user)
  const [threshold, setThreshold] = useState(85)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [autoCrystallize, setAutoCrystallize] = useState(true)

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Avatar */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative group cursor-pointer">
            <div className="size-32 rounded-3xl border-4 border-primary/20 overflow-hidden shadow-2xl shadow-primary/10 group-hover:border-primary/40 transition-all bg-surface-dark flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                <User size={48} className="text-slate-600" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
              <Camera size={24} className="text-white" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-xl border-4 border-bg-dark shadow-lg hover:scale-110 active:scale-95 transition-transform z-10">
              <User size={18} />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-main">{user?.name ?? "User"}</h2>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">
              {user?.role === "pro" ? t("premiumMember") : t("freeMember")}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Account & Security */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">
              {t("accountSecurity")}
            </h3>
            <div className="bg-surface-dark/40 border border-border-dark rounded-2xl overflow-hidden">
              <SettingItem
                icon={User}
                title={t("profileInfo")}
                subtitle={user?.email ?? ""}
              />
              <SettingItem
                icon={Shield}
                title={t("securityPrivacy")}
                subtitle={t("twoFactorActive")}
              />
              <SettingItem
                icon={ImageIcon}
                title={t("customIcons")}
                subtitle={t("customIconsDesc")}
              />
              <SettingItem
                icon={Zap}
                title={t("subscription")}
                subtitle={t("subscriptionDesc")}
              />
            </div>
          </section>

          {/* AI Preferences */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">
              {t("aiPreferences")}
            </h3>
            <div className="bg-surface-dark/40 border border-border-dark rounded-2xl p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-text-main">
                      {t("classificationThreshold")}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t("classificationThresholdDesc")}
                    </p>
                  </div>
                  <span className="text-primary font-mono font-bold text-lg">
                    {threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-text-main transition-colors mt-2 group"
                >
                  <Sliders
                    size={12}
                    className="group-hover:rotate-180 transition-transform duration-500"
                  />
                  {t("customizeThreshold")}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-main">
                    {t("autoCrystallize")}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("autoCrystallizeDesc")}
                  </p>
                </div>
                <div
                  onClick={() => setAutoCrystallize(!autoCrystallize)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${
                    autoCrystallize ? "bg-primary" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 size-3 bg-white rounded-full transition-all duration-300 ${
                      autoCrystallize ? "right-1" : "right-6"
                    }`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* System */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">
              {t("system")}
            </h3>
            <div className="bg-surface-dark/40 border border-border-dark rounded-2xl overflow-hidden">
              <SettingItem
                icon={Bell}
                title={t("notifications")}
                subtitle={t("notificationsDesc")}
              />
              <SettingItem
                icon={Globe}
                title={t("language")}
                subtitle={t("languageDesc")}
              />
              <SettingItem
                icon={Smartphone}
                title={t("connectedDevices")}
                subtitle={t("connectedDevicesDesc")}
              />
              <SettingItem
                icon={Database}
                title={t("dataManagement")}
                subtitle={t("dataManagementDesc")}
              />
            </div>
          </section>

          {/* Sign Out */}
          <div className="pt-4 pb-12">
            <button
              onClick={() => logout()}
              className="w-full py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold border border-red-500/10 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              {t("signOut")}
            </button>
            <p className="text-center text-[10px] text-slate-600 mt-6 font-mono">
              {t("version")} <br />
              {t("buildId")}
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface-dark border border-border-dark rounded-3xl p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-text-main transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-main">
                    {t("granularTitle")}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {t("granularDesc")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {t("precisionValue")}
                    </label>
                    <span className="text-4xl font-black text-primary font-mono">
                      {threshold}%
                    </span>
                  </div>

                  <div className="space-y-8 py-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={threshold}
                      onChange={(e) =>
                        setThreshold(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t("directInput")}
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={threshold}
                            onChange={(e) =>
                              setThreshold(
                                Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    parseFloat(e.target.value) || 0
                                  )
                                )
                              )
                            }
                            className="bg-transparent text-xl font-bold text-text-main outline-none w-full"
                          />
                          <span className="text-slate-500 font-bold">%</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t("sensitivity")}
                        </p>
                        <p className="text-sm font-bold text-text-main">
                          {threshold > 90
                            ? t("ultraHigh")
                            : threshold > 70
                              ? t("balanced")
                              : t("highRecall")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t("savePreferences")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
