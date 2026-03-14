import React, { useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  Search,
  Diamond,
  FlaskConical,
  Archive,
  LayoutGrid,
  List,
  ChevronDown,
  X,
} from "lucide-react-native"
import type { LucideIcon } from "lucide-react-native"
import { useColors } from "../theme"

const mono = Platform.select({
  ios: { fontFamily: "Menlo" as const },
  android: { fontFamily: "monospace" as const },
})

interface KnowledgeItem {
  id: string
  title: string
  desc: string
  tags: string[]
  time: string
  type: string
  icon: LucideIcon
}

const MOCK_DATA: KnowledgeItem[] = [
  {
    id: "1",
    title: "Q4 Market Expansion Thesis",
    desc: "Comprehensive analysis of the APAC tech corridor and identified entry points for modular AI units.",
    tags: ["Market", "APAC"],
    time: "2h ago",
    type: "Strategy",
    icon: Diamond,
  },
  {
    id: "2",
    title: "Neural Lattice Performance",
    desc: "Experimental data regarding the latency of sub-nanosecond processing in distributed crystal cores.",
    tags: ["AI", "Hardware"],
    time: "Yesterday",
    type: "Research",
    icon: FlaskConical,
  },
  {
    id: "3",
    title: "Legacy System Deprecation",
    desc: "Historical records of the transition from monolithic to decentralized Dorian architecture.",
    tags: ["Legacy", "DevOps"],
    time: "Oct 12",
    type: "Archive",
    icon: Archive,
  },
]

export function KnowledgeScreen() {
  const colors = useColors()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchText, setSearchText] = useState("")

  const renderGridItem = useCallback(
    ({ item }: { item: KnowledgeItem }) => (
      <KnowledgeCardGrid item={item} colors={colors} />
    ),
    [colors]
  )

  const renderListItem = useCallback(
    ({ item }: { item: KnowledgeItem }) => (
      <KnowledgeCardList item={item} colors={colors} />
    ),
    [colors]
  )

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={s.headerSection}>
        <View style={s.headerRow}>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>Knowledge Library</Text>
          <View style={s.headerControls}>
            {/* View mode toggle */}
            <View
              style={[
                s.viewToggle,
                {
                  backgroundColor: "#18181B", // bg-surface
                  borderColor: "#27272A", // border-border
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setViewMode("grid")}
                style={[
                  s.toggleBtn,
                  viewMode === "grid" && s.toggleBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <LayoutGrid
                  size={16}
                  color={viewMode === "grid" ? colors.foreground : "#64748B"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                style={[
                  s.toggleBtn,
                  viewMode === "list" && s.toggleBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <List
                  size={16}
                  color={viewMode === "list" ? colors.foreground : "#64748B"}
                />
              </TouchableOpacity>
            </View>

            {/* Filter button */}
            <TouchableOpacity
              style={[
                s.filterButton,
                {
                  backgroundColor: "#18181B", // bg-surface
                  borderColor: "#27272A", // border-border
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[s.filterText, { color: colors.foreground }]}>Filter</Text>
              <ChevronDown size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={s.searchContainer}>
          <Search size={20} color="#64748B" style={s.searchIconLeft} />
          <TextInput
            style={[
              s.searchInput,
              {
                backgroundColor: "#18181BCC", // bg-surface/80
                borderColor: "#27272A", // border-border
                color: colors.foreground,
              },
            ]}
            placeholder="Search your second brain..."
            placeholderTextColor="#64748B"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={s.searchClearBtn}
              onPress={() => setSearchText("")}
              activeOpacity={0.7}
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Card list */}
      {viewMode === "grid" ? (
        <FlatList
          data={MOCK_DATA}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={s.gridRow}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={MOCK_DATA}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

// -- Grid Card Component --

function KnowledgeCardGrid({
  item,
  colors,
}: {
  item: KnowledgeItem
  colors: ReturnType<typeof useColors>
}) {
  const Icon = item.icon
  const isArchive = item.type === "Archive"

  return (
    <TouchableOpacity style={s.gridCard} activeOpacity={0.7}>
      {/* Glow decoration */}
      <View style={s.glowCircle} />

      {/* Badge + Time row */}
      <View style={[s.cardHeaderRow, { zIndex: 10 }]}>
        <View
          style={[
            s.typeBadge,
            isArchive
              ? { backgroundColor: "#18181B", borderColor: "#27272A" }
              : { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" },
          ]}
        >
          <Icon size={12} color={isArchive ? "#94A3B8" : colors.brandFrom} />
          <Text
            style={[
              s.typeBadgeText,
              { color: isArchive ? "#94A3B8" : colors.brandFrom },
            ]}
          >
            {item.type}
          </Text>
        </View>
        <Text style={s.timeText}>{item.time}</Text>
      </View>

      {/* Title */}
      <Text style={[s.gridCardTitle, { color: colors.foreground, zIndex: 10 }]}>
        {item.title}
      </Text>

      {/* Description */}
      <Text style={s.gridCardDesc} numberOfLines={2}>
        {item.desc}
      </Text>

      {/* Tags */}
      <View style={[s.tagsRow, { zIndex: 10, marginTop: "auto" }]}>
        {item.tags.map((tag) => (
          <Text key={tag} style={s.tagText}>
            #{tag}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  )
}

// -- List Card Component --

function KnowledgeCardList({
  item,
  colors,
}: {
  item: KnowledgeItem
  colors: ReturnType<typeof useColors>
}) {
  const Icon = item.icon
  const isArchive = item.type === "Archive"

  return (
    <TouchableOpacity style={s.listCard} activeOpacity={0.7}>
      {/* Glow decoration */}
      <View style={s.glowCircleList} />

      {/* Badge */}
      <View style={[s.listBadgeCol, { zIndex: 10 }]}>
        <View
          style={[
            s.typeBadge,
            isArchive
              ? { backgroundColor: "#18181B", borderColor: "#27272A" }
              : { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" },
          ]}
        >
          <Icon size={12} color={isArchive ? "#94A3B8" : colors.brandFrom} />
          <Text
            style={[
              s.typeBadgeText,
              { color: isArchive ? "#94A3B8" : colors.brandFrom },
            ]}
          >
            {item.type}
          </Text>
        </View>
      </View>

      {/* Title + Desc */}
      <View style={[s.listContentCol, { zIndex: 10 }]}>
        <Text style={[s.listCardTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={s.listCardDesc} numberOfLines={1}>
          {item.desc}
        </Text>
      </View>

      {/* Tags + Time */}
      <View style={[s.listMetaCol, { zIndex: 10 }]}>
        <View style={s.tagsRow}>
          {item.tags.map((tag) => (
            <Text key={tag} style={s.tagText}>
              #{tag}
            </Text>
          ))}
        </View>
        <Text style={s.timeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },

  // Header section
  headerSection: {
    paddingHorizontal: 16, // p-4
    gap: 32, // space-y-8 top-level, but between header and search just use gap
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16, // gap-4
  },
  headerTitle: {
    fontSize: 30, // text-3xl
    fontWeight: "700", // font-bold
    letterSpacing: -0.75, // tracking-tight ~ -0.025 * 30
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // gap-3
  },

  // View toggle
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    padding: 4, // p-1
  },
  toggleBtn: {
    padding: 6, // p-1.5
    borderRadius: 6, // rounded-md
  },
  toggleBtnActive: {
    backgroundColor: "rgba(255,255,255,0.1)", // bg-white/10
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Filter button
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
  },
  filterText: {
    fontSize: 14, // text-sm
    fontWeight: "500", // font-medium
  },

  // Search bar
  searchContainer: {
    position: "relative",
    marginTop: 16,
  },
  searchIconLeft: {
    position: "absolute",
    left: 16, // left-4
    top: "50%",
    marginTop: -10, // half of icon size 20
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    paddingLeft: 48, // pl-12
    paddingRight: 48, // pr-12
    paddingVertical: 14, // py-3.5
    fontSize: 14, // text-sm
  },
  searchClearBtn: {
    position: "absolute",
    right: 16, // right-4
    top: "50%",
    marginTop: -8, // half of icon size 16
    zIndex: 1,
  },

  // List content
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 16, // grid gap-6 for grid mode doesn't apply here; we use columnWrapperStyle for grid rows
  },
  gridRow: {
    gap: 16, // gap between columns in grid
  },

  // Grid Card
  gridCard: {
    flex: 1,
    backgroundColor: "#18181B66", // bg-surface/40
    borderColor: "#27272A80", // border-border/50
    borderWidth: 1,
    borderRadius: 16, // rounded-2xl
    padding: 24, // p-6
    overflow: "hidden",
    minHeight: 200,
  },

  // Glow circle (decorative, simulating blur)
  glowCircle: {
    position: "absolute",
    right: -32, // -right-8
    top: -32, // -top-8
    width: 128, // size-32
    height: 128,
    borderRadius: 9999, // rounded-full
    backgroundColor: "#10B9810D", // bg-primary/5
  },
  glowCircleList: {
    position: "absolute",
    right: -32,
    top: -32,
    width: 128,
    height: 128,
    borderRadius: 9999,
    backgroundColor: "#10B9810D",
  },

  // Card header row (badge + time)
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16, // mb-4
  },

  // Type badge (pill)
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // gap-1.5
    borderRadius: 9999, // rounded-full
    borderWidth: 1,
    paddingHorizontal: 10, // px-2.5
    paddingVertical: 4, // py-1
  },
  typeBadgeText: {
    fontSize: 10, // text-[10px]
    fontWeight: "700", // font-bold
    textTransform: "uppercase",
    letterSpacing: 1.6, // tracking-widest
  },

  // Time text
  timeText: {
    fontSize: 10, // text-[10px]
    color: "#64748B", // text-slate-500
    ...mono,
  },

  // Grid card title
  gridCardTitle: {
    fontSize: 18, // text-lg
    fontWeight: "700", // font-bold
    marginBottom: 8, // mb-2
  },

  // Grid card desc
  gridCardDesc: {
    fontSize: 14, // text-sm
    color: "#94A3B8", // text-slate-400
    marginBottom: 16, // mb-4
    zIndex: 10,
    flex: 1,
  },

  // Tags row
  tagsRow: {
    flexDirection: "row",
    gap: 8, // gap-2
  },
  tagText: {
    fontSize: 12, // text-xs
    color: "#64748B", // text-slate-500
    ...mono,
  },

  // List Card
  listCard: {
    backgroundColor: "#18181B66", // bg-surface/40
    borderColor: "#27272A80", // border-border/50
    borderWidth: 1,
    borderRadius: 16, // rounded-2xl
    paddingHorizontal: 20, // p-4 sm:p-5 → use 20 for mobile
    paddingVertical: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // gap-4
  },

  // List badge column
  listBadgeCol: {
    flexShrink: 0,
  },

  // List content column
  listContentCol: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: 16, // text-base
    fontWeight: "700", // font-bold
    marginBottom: 4, // mb-1
  },
  listCardDesc: {
    fontSize: 14, // text-sm
    color: "#94A3B8", // text-slate-400
  },

  // List meta column
  listMetaCol: {
    flexShrink: 0,
    alignItems: "flex-end",
    gap: 8, // gap for tags and time
  },
})
