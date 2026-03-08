// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import { Sparkles } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/i18n/navigation"

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-primary" />
          <span className="text-xl font-bold">Ask Dorian</span>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("forgotPasswordTitle")}</CardTitle>
          <CardDescription>{t("forgotPasswordDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="dorian@example.com"
              className="h-9"
            />
          </div>
          <Button className="w-full">{t("sendResetLink")}</Button>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary font-medium hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
