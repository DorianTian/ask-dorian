"use client"

import { Sparkles, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-muted">
          <Sparkles className="size-7 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tighter text-muted-foreground/20">404</h1>
          <p className="text-lg font-medium">
            This fragment got lost
          </p>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <a
            href="/zh/today"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="size-4" />
            Back to Today
          </a>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
