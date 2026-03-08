// @Phase2+
"use client"

import { useTranslations } from "next-intl"
import { BookOpen, Search, Plus, Star, Clock, Tag, FolderOpen } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Link } from "@/i18n/navigation"
import { knowledgeItems } from "@/lib/mock-data"

export default function KnowledgePage() {
  const t = useTranslations("knowledge")

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t("search")}</span>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-3.5" />
          {t("newNote")}
        </Button>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent" className="gap-1">
            <Clock className="size-3" />{t("recent")}
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1">
            <FolderOpen className="size-3" />{t("categories")}
          </TabsTrigger>
          <TabsTrigger value="starred" className="gap-1">
            <Star className="size-3" />{t("starred")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {knowledgeItems.map((item) => (
              <Link key={item.id} href={`/knowledge/${item.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-3 text-xs">
                    {item.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        <Tag className="size-2.5 mr-0.5" />{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                    {item.projectName && <span>{item.projectName}</span>}
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        {["categories", "starred"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              {tab} view
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
