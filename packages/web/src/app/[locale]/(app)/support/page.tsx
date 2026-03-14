"use client"

import { useState, useMemo, useCallback } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import {
  HelpCircle,
  MessageSquare,
  Book,
  Shield,
  LifeBuoy,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Search,
  CheckCircle2,
  X,
  FileText,
  Zap,
  Lock,
  Mail,
  Send,
  type LucideIcon,
} from "lucide-react"

interface CategoryDetail {
  icon: LucideIcon
  title: string
  desc: string
  color: string
  articles: { icon: LucideIcon; title: string; desc: string; content: string }[]
}

function CategoryDetailModal({
  category,
  onClose,
}: {
  category: CategoryDetail | null
  onClose: () => void
}) {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null)

  if (!category) return null

  const handleToggleArticle = (index: number) => {
    setExpandedArticle(expandedArticle === index ? null : index)
  }

  return (
    <AnimatePresence>
      {category && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-dark border border-border-dark rounded-[2rem] overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-border-dark flex items-center justify-between bg-surface-dark/50">
              <div className="flex items-center gap-4">
                <div
                  className={`size-12 rounded-2xl bg-white/5 flex items-center justify-center ${category.color}`}
                >
                  <category.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main">
                    {category.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {category.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* Articles */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-3 custom-scrollbar">
              {category.articles.map((article, i) => (
                <div
                  key={i}
                  onClick={() => handleToggleArticle(i)}
                  className={`p-4 rounded-xl bg-white/5 border transition-all cursor-pointer group ${expandedArticle === i ? "border-primary/30" : "border-transparent hover:border-primary/20"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                      <article.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {article.desc}
                      </p>
                    </div>
                    {expandedArticle === i ? (
                      <ChevronDown
                        size={16}
                        className="text-primary mt-1 shrink-0 transition-all"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="text-slate-600 mt-1 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                      />
                    )}
                  </div>
                  {expandedArticle === i && (
                    <div className="mt-4 ml-14 text-sm text-slate-400 leading-relaxed border-t border-border-dark pt-4">
                      {article.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-border-dark bg-surface-dark/50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-main rounded-xl text-sm font-bold transition-all border border-white/5"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function SupportPage() {
  const t = useTranslations("support")
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryDetail | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = useCallback(() => {
    setFeedbackText("")
    setFeedbackSubmitted(true)
    setShowFeedbackForm(false)
    setTimeout(() => setFeedbackSubmitted(false), 3000)
  }, [])

  const categories: CategoryDetail[] = [
    {
      icon: Book,
      title: t("documentation"),
      desc: t("documentationDesc"),
      color: "text-indigo-500",
      articles: [
        {
          icon: Zap,
          title: "Getting Started with Dorian",
          desc: "Learn the basics — capturing fragments, using the AI pipeline, and organizing your knowledge.",
          content: "Welcome to Dorian! Start by capturing your first fragment using the quick capture bar (⌘K). Fragments can be text, voice memos, screenshots, or URLs. Once captured, the AI pipeline automatically classifies, extracts actionable items, and links related knowledge. Visit the Stream to see your incoming fragments and the Knowledge Library for confirmed, searchable entries.",
        },
        {
          icon: FileText,
          title: "Fragment Types & Input Sources",
          desc: "Text, voice, images, URLs — understand all supported input formats and how they're processed.",
          content: "Dorian supports multiple input types: plain text (typed or pasted), voice memos (transcribed via Whisper API), screenshots (OCR via Claude Vision), and URLs (content extracted and summarized). Each source flows through the same AI pipeline but is processed differently based on its type. Voice memos extract action items with higher priority, while URLs are summarized and linked to related knowledge.",
        },
        {
          icon: Book,
          title: "Knowledge Library Guide",
          desc: "How confirmed fragments become searchable knowledge. Tags, projects, and semantic search.",
          content: "The Knowledge Library stores confirmed, high-quality fragments as searchable knowledge cards. Each card is embedded using OpenAI text-embedding-3-small for semantic search. You can organize with tags, assign to projects, and link related cards. The library supports full-text search (Chinese via nodejieba segmentation) and vector similarity search for finding conceptually related content.",
        },
        {
          icon: Zap,
          title: "Keyboard Shortcuts & Quick Capture",
          desc: "Master ⌘K quick capture, global search, and navigation shortcuts for maximum efficiency.",
          content: "Key shortcuts: ⌘K opens quick capture from anywhere in the app. ⌘/ opens global search. ⌘1-5 navigate between main sections (Today, Stream, Knowledge, Review, Settings). In the desktop menubar app, the global hotkey works system-wide even when Dorian is not focused. Escape closes any modal or overlay.",
        },
        {
          icon: FileText,
          title: "Weekly Review & Insights",
          desc: "How Dorian generates your weekly review, focus scores, and actionable recommendations.",
          content: "Every week, Dorian compiles your activity into a comprehensive review. It calculates focus scores based on ritual completion rates, tracks deep work streaks, and summarizes completed tasks and processed fragments. AI-generated insights highlight patterns in your productivity and suggest adjustments for the upcoming week.",
        },
      ],
    },
    {
      icon: HelpCircle,
      title: t("faq"),
      desc: t("faqDesc"),
      color: "text-emerald-500",
      articles: [
        {
          icon: HelpCircle,
          title: "What happens to my voice memos?",
          desc: "Voice is transcribed via Whisper API, then processed by AI to extract tasks and insights. Audio is not stored.",
          content: "When you record a voice memo, the audio is sent to OpenAI's Whisper API for transcription. The resulting text is then processed through Dorian's AI pipeline (Claude Sonnet for understanding, Claude Haiku for classification). The original audio file is discarded after transcription — only the text and extracted metadata are stored in your account.",
        },
        {
          icon: HelpCircle,
          title: "Can I use Dorian offline?",
          desc: "The desktop menubar app queues captures offline. They sync and process when you're back online.",
          content: "The Tauri desktop app supports offline capture. Fragments are stored locally and queued for sync. When connectivity is restored, they are uploaded and processed in order. Note that AI features (classification, summarization) require an internet connection and will run once the fragments are synced.",
        },
        {
          icon: HelpCircle,
          title: "How does AI classification work?",
          desc: "Claude Haiku classifies fragments by type and intent. You can adjust the confidence threshold in Settings.",
          content: "Each incoming fragment is sent to Claude Haiku with a structured prompt that classifies it into categories (task, note, idea, reference, question). The model also extracts intent, urgency, and relevant tags. If the confidence score is below your threshold (default 0.7), the fragment is marked as 'pending review' for manual confirmation.",
        },
        {
          icon: HelpCircle,
          title: "What's the difference between Stream and Library?",
          desc: "Stream shows all incoming fragments. Library contains only confirmed, knowledge-grade fragments.",
          content: "The Stream is your inbox — it shows all captured fragments in chronological order, including pending, processing, and confirmed items. The Knowledge Library is curated: only fragments you confirm (or that pass the AI confidence threshold) appear here. Library items are fully indexed, embedded for semantic search, and linked to your knowledge graph.",
        },
        {
          icon: HelpCircle,
          title: "How do I export my data?",
          desc: "Go to Settings → Data Management. You can export all fragments, tasks, and knowledge as JSON or CSV.",
          content: "Navigate to Settings → Data Management → Export. Choose between JSON (full fidelity, includes metadata and embeddings) or CSV (simplified, spreadsheet-compatible). You can export all data or filter by date range, type, or project. Exports are generated server-side and delivered as a downloadable zip file.",
        },
      ],
    },
    {
      icon: Shield,
      title: t("privacySecurity"),
      desc: t("privacySecurityDesc"),
      color: "text-blue-500",
      articles: [
        {
          icon: Lock,
          title: "End-to-End Encryption",
          desc: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). API keys are never stored in plaintext.",
          content: "All communication between clients and the Dorian API is encrypted via TLS 1.3 (enforced by Cloudflare). Data at rest in PostgreSQL is encrypted using AES-256 via AWS RDS encryption. API keys and tokens are stored as bcrypt hashes (cost factor 12). Refresh tokens use rotation with reuse detection to prevent token theft.",
        },
        {
          icon: Shield,
          title: "Data Residency & Storage",
          desc: "Data is stored in AWS Singapore (ap-southeast-1). PostgreSQL with pgvector for embeddings.",
          content: "All user data resides in AWS ap-southeast-1 (Singapore). The primary database is PostgreSQL 16 on RDS (db.t3.micro) with pgvector 0.8.1 for embedding storage. Backups are automated daily with 7-day retention. No data is replicated to other regions unless explicitly requested for disaster recovery.",
        },
        {
          icon: Lock,
          title: "AI Processing Privacy",
          desc: "Fragments are sent to Claude API for processing. Anthropic does not train on your data. See our DPA.",
          content: "Fragment content is sent to Anthropic's Claude API and OpenAI's embedding API for processing. Per both providers' enterprise terms, your data is not used for model training. We maintain Data Processing Agreements (DPAs) with both providers. Fragment content is transmitted securely and is not logged on Dorian's servers beyond what is stored in your account.",
        },
        {
          icon: Shield,
          title: "Authentication & Access Control",
          desc: "JWT-based auth with device binding, refresh token rotation, and optional two-factor authentication.",
          content: "Authentication uses JWT HS256 with 15-minute access tokens and 7-day refresh tokens with rotation. Each session is bound to a device fingerprint. Refresh token reuse is detected and triggers immediate session revocation across all devices. Two-factor authentication via TOTP (Google Authenticator, Authy) is available in Settings → Security.",
        },
        {
          icon: Lock,
          title: "Data Deletion & Right to Forget",
          desc: "Request full account deletion anytime. All data including embeddings is permanently removed within 72 hours.",
          content: "You can request account deletion from Settings → Account → Delete Account, or by emailing privacy@askdorian.com. Upon confirmation, all data is soft-deleted immediately (removing access) and permanently purged within 72 hours. This includes all fragments, tasks, knowledge cards, embeddings, session tokens, and audit logs.",
        },
      ],
    },
    {
      icon: LifeBuoy,
      title: t("directSupport"),
      desc: t("directSupportDesc"),
      color: "text-rose-500",
      articles: [
        {
          icon: Mail,
          title: "Email Support",
          desc: "Reach us at support@askdorian.com. Priority response for Pro members within 4 hours.",
          content: "Send your questions, issues, or suggestions to support@askdorian.com. Free tier users receive responses within 24 hours. Pro members get priority support with a 4-hour response window during business hours (9 AM — 6 PM SGT, Mon-Fri). Include your account email and a description of the issue for fastest resolution.",
        },
        {
          icon: MessageSquare,
          title: "Community Discord",
          desc: "Join our Discord community for tips, feature requests, and connecting with other Dorian users.",
          content: "Our Discord server is the best place to connect with other Dorian users, share workflows, and get quick help from the community. Channels include #general, #tips-and-tricks, #feature-requests, and #bug-reports. The Dorian team actively monitors and participates in discussions.",
        },
        {
          icon: LifeBuoy,
          title: "Bug Reports",
          desc: "Found a bug? Report it through the app (Settings → Send Feedback) or via GitHub Issues.",
          content: "To report a bug: go to Settings → Send Feedback and select 'Bug Report'. Include steps to reproduce, expected vs actual behavior, and your browser/OS version. For open-source components, you can also file GitHub Issues directly. Critical bugs (data loss, security) are prioritized and typically patched within 24 hours.",
        },
        {
          icon: Zap,
          title: "Feature Requests",
          desc: "Vote on upcoming features and submit your own ideas on our public roadmap board.",
          content: "Visit our public roadmap at roadmap.askdorian.com to see planned features, vote on priorities, and submit your own ideas. Top-voted features are reviewed monthly and added to the development queue. You can also discuss feature ideas in the #feature-requests channel on Discord.",
        },
        {
          icon: FileText,
          title: "API & Integration Support",
          desc: "Building on top of Dorian? Check our API docs or contact the developer relations team.",
          content: "Dorian's REST API is documented at docs.askdorian.com/api. The API uses JWT authentication and follows RESTful conventions with versioned endpoints (/v1/). Rate limits: 100 requests/minute for free tier, 1000/minute for Pro. For integration partnerships or custom needs, contact devrel@askdorian.com.",
        },
      ],
    },
  ]

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const query = searchQuery.toLowerCase()
    return categories
      .map((cat) => {
        const titleMatch = cat.title.toLowerCase().includes(query)
        const descMatch = cat.desc.toLowerCase().includes(query)
        const matchingArticles = cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.desc.toLowerCase().includes(query)
        )
        if (titleMatch || descMatch || matchingArticles.length > 0) {
          return {
            ...cat,
            articles: matchingArticles.length > 0 ? matchingArticles : cat.articles,
          }
        }
        return null
      })
      .filter((cat): cat is CategoryDetail => cat !== null)
  }, [searchQuery, categories])

  const systemStatus = [
    { name: t("neuralEngine"), status: "operational" as const },
    { name: t("fragmentExtraction"), status: "operational" as const },
    { name: t("cloudSync"), status: "operational" as const },
    { name: t("searchIndexing"), status: "degraded" as const },
  ]

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            {t("title")}
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">{t("subtitle")}</p>
          <div className="max-w-2xl mx-auto relative mt-8">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-surface-dark border border-border-dark rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all shadow-xl shadow-black/20 text-text-main"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedCategory(cat)}
                className="bg-surface-dark/40 border border-border-dark rounded-2xl p-6 flex gap-6 group hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer"
              >
                <div
                  className={`size-14 rounded-2xl bg-white/5 flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}
                >
                  <cat.icon size={28} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                      {cat.title}
                    </h3>
                    <ChevronRight
                      size={18}
                      className="text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Search size={32} className="text-slate-600 mx-auto" />
            <p className="text-sm text-slate-500">No results found for &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-primary font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Feedback Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="size-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <MessageSquare size={40} />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-xl font-bold text-text-main">
                {t("suggestionTitle")}
              </h3>
              <p className="text-slate-400">{t("suggestionDesc")}</p>
            </div>
            {feedbackSubmitted ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm whitespace-nowrap">
                <CheckCircle2 size={18} /> Thank you!
              </div>
            ) : (
              <button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
              >
                {t("sendFeedback")}
              </button>
            )}
          </div>
          {showFeedbackForm && (
            <div className="space-y-4 border-t border-primary/20 pt-6">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think, report a bug, or suggest a feature..."
                rows={4}
                className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-primary transition-all resize-none placeholder:text-slate-600"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackForm(false)
                    setFeedbackText("")
                  }}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-text-main hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim()}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send size={14} /> Submit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-main">
              {t("systemStatus")}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={12} />
              {t("allOperational")}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {systemStatus.map((sys, i) => (
              <div
                key={i}
                className="bg-surface-dark/40 border border-border-dark rounded-xl p-4 flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-400">
                  {sys.name}
                </span>
                {sys.status === "operational" ? (
                  <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                ) : (
                  <div className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-8 border-t border-border-dark flex flex-wrap justify-center gap-8">
          <a href="#terms" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
            {t("termsOfService")} <ExternalLink size={12} />
          </a>
          <a href="#privacy" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
            {t("privacyPolicy")} <ExternalLink size={12} />
          </a>
          <a href="#cookies" className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
            {t("cookiePolicy")} <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Category Detail Modal */}
      <CategoryDetailModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />
    </div>
  )
}
