"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Diamond, Zap, Globe } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] overflow-x-hidden relative selection:bg-emerald-500/30 text-[#f8fafc]">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] -left-[10%] size-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] -right-[10%] size-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Diamond size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Dorian
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">
            Philosophy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Pricing
          </a>
        </div>
        <Link
          href="/en/login"
          className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 pt-20 pb-32 px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} />
            <span>Fragment-First Philosophy</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
            CRYSTALLIZE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-indigo-400 to-emerald-500/60">
              YOUR THOUGHTS
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Dorian is your premium AI thought partner. Capture fragments of
            knowledge, voice memos, and screenshots. Watch them transform into
            actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/en/login"
              className="bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-all flex items-center gap-2 group"
            >
              Start Your Flow
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <button className="px-8 py-4 rounded-full text-lg font-bold text-white border border-white/10 hover:bg-white/5 transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-24 relative"
        >
          <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#18181b]/40 p-4 shadow-2xl backdrop-blur-sm overflow-hidden">
            <div className="rounded-2xl w-full h-[400px] md:h-[500px] bg-gradient-to-br from-[#18181b] via-emerald-500/5 to-[#18181b] flex items-center justify-center">
              <div className="text-center space-y-4 opacity-50">
                <Diamond size={48} className="mx-auto text-emerald-500" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  App Preview
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
          </div>

          {/* Floating Features */}
          <div className="absolute -top-12 -left-12 hidden lg:block">
            <div className="bg-[#18181b]/70 backdrop-blur-xl border border-[#27272a]/50 p-4 rounded-2xl space-y-2 max-w-[200px] text-left">
              <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Zap size={18} />
              </div>
              <p className="text-sm font-bold text-white">
                Instant Extraction
              </p>
              <p className="text-[10px] text-slate-500">
                AI identifies tasks from voice memos in milliseconds.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 hidden lg:block">
            <div className="bg-[#18181b]/70 backdrop-blur-xl border border-[#27272a]/50 p-4 rounded-2xl space-y-2 max-w-[200px] text-left">
              <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Globe size={18} />
              </div>
              <p className="text-sm font-bold text-white">Context Aware</p>
              <p className="text-[10px] text-slate-500">
                Dorian remembers your projects and previous fragments.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Diamond size={16} />
            <span className="text-sm font-bold tracking-tight">
              Dorian AI © 2024
            </span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <a
              href="#"
              className="hover:text-emerald-500 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-emerald-500 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-emerald-500 transition-colors"
            >
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
