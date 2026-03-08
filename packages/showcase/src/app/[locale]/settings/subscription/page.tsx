// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import { CreditCard, Check, X, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const plans = [
  {
    name: "free",
    price: "$0",
    period: "",
    features: {
      fragments: "50/月",
      ai: true,
      advancedAi: false,
      calendarSync: false,
      dataExport: false,
      collaboration: false,
    },
  },
  {
    name: "pro",
    price: "$9.99",
    period: "perMonth",
    features: {
      fragments: "无限",
      ai: true,
      advancedAi: true,
      calendarSync: true,
      dataExport: true,
      collaboration: false,
    },
    current: true,
  },
  {
    name: "team",
    price: "$19.99",
    period: "perUser",
    features: {
      fragments: "无限",
      ai: true,
      advancedAi: true,
      calendarSync: true,
      dataExport: true,
      collaboration: true,
    },
    comingSoon: true,
  },
]

const billingHistory = [
  { date: "2026-03-01", amount: "$9.99", status: "paid", description: "Pro Plan - March 2026" },
  { date: "2026-02-01", amount: "$9.99", status: "paid", description: "Pro Plan - February 2026" },
  { date: "2026-01-01", amount: "$9.99", status: "paid", description: "Pro Plan - January 2026" },
]

export default function SubscriptionPage() {
  const t = useTranslations("settingsSubscription")

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Current Plan */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-4" />
            {t("currentPlan")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className="bg-violet-100 text-violet-700">{t("pro")}</Badge>
            <span className="text-lg font-semibold">$9.99{t("perMonth")}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("expiresAt")}: 2026-04-01
          </p>
        </CardContent>
      </Card>

      {/* Plan Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.name} className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium">{t(plan.name as "free" | "pro" | "team")}</span>
                      <span className="text-xs text-muted-foreground">
                        {plan.price}
                        {plan.period && t(plan.period as "perMonth" | "perUser")}
                      </span>
                      {plan.comingSoon && (
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{t("fragments")}</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.name} className="text-center text-sm">
                    {plan.features.fragments}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>AI Classification</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.name} className="text-center">
                    {plan.features.ai ? (
                      <Check className="size-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="size-4 text-gray-400 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Advanced AI</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.name} className="text-center">
                    {plan.features.advancedAi ? (
                      <Check className="size-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="size-4 text-gray-400 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Calendar Sync</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.name} className="text-center">
                    {plan.features.calendarSync ? (
                      <Check className="size-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="size-4 text-gray-400 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Data Export</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.name} className="text-center">
                    {plan.features.dataExport ? (
                      <Check className="size-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="size-4 text-gray-400 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Collaboration</TableCell>
                {plans.map((plan) => (
                  <TableCell key={plan.name} className="text-center">
                    {plan.features.collaboration ? (
                      <Check className="size-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="size-4 text-gray-400 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("usage")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{t("fragments")}</span>
              <span className="text-muted-foreground">{`38 / ${t("unlimited")}`}</span>
            </div>
            <Progress value={38} max={100} />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{t("aiCalls")}</span>
              <span className="text-muted-foreground">156 / 500</span>
            </div>
            <Progress value={156} max={500} />
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("billingHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingHistory.map((bill, index) => (
              <div key={bill.date}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{bill.description}</p>
                    <p className="text-xs text-muted-foreground">{bill.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{bill.amount}</span>
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700 text-xs"
                    >
                      Paid
                    </Badge>
                  </div>
                </div>
                {index < billingHistory.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
