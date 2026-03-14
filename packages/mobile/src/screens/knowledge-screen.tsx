import React, { useState, useCallback, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  Search,
  FileText,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  BookOpen,
} from "lucide-react-native"
import { useKnowledge } from "@ask-dorian/core/hooks"
import type { Knowledge } from "@ask-dorian/core/types"
import { useColors } from "../theme"

const mono = Platform.select({
  ios: { fontFamily: "Menlo" as const },
  android: { fontFamily: "monospace" as const },
})

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function KnowledgeScreen() {
  const colors = useColors()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchText, setSearchText] = useState("")
  const { data: items, isLoading, mutate } = useKnowledge()
  const [selectedItem, setSelectedItem] = useState<Knowledge | null>(null)
  const slideAnim = useRef(new Animated.Value(0)).current
  const screenHeight = Dimensions.get("window").height

  const filtered = (items ?? []).filter((item) => {
    if (!searchText) return true
    const q = searchText.toLowerCase()
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    )
  })

  const openSheet = useCallback((item: Knowledge) => {
    setSelectedItem(item)
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start()
  }, [slideAnim])

  const closeSheet = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedItem(null))
  }, [slideAnim])

  const renderGridItem = useCallback(
    ({ item }: { item: Knowledge }) => (
      <KnowledgeCardGrid item={item} colors={colors} onPress={() => openSheet(item)} />
    ),
    [colors, openSheet]
  )

  const renderListItem = useCallback(
    ({ item }: { item: Knowledge }) => (
      <KnowledgeCardList item={item} colors={colors} onPress={() => openSheet(item)} />
    ),
    [colors, openSheet]
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
                  backgroundColor: colors.card,
                  borderColor: colors.border,
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
                  color={viewMode === "grid" ? colors.foreground : colors.textMuted}
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
                  color={viewMode === "list" ? colors.foreground : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Filter button */}
            <TouchableOpacity
              style={[
                s.filterButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[s.filterText, { color: colors.foreground }]}>Filter</Text>
              <ChevronDown size={14} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={s.searchContainer}>
          <Search size={20} color={colors.textMuted} style={s.searchIconLeft} />
          <TextInput
            style={[
              s.searchInput,
              {
                backgroundColor: colors.card + "CC",
                color: colors.foreground,
              },
            ]}
            placeholder="Search your second brain..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={s.searchClearBtn}
              onPress={() => setSearchText("")}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading */}
      {isLoading && !items ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandFrom} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.emptyContainer}>
          <BookOpen size={40} color={colors.mutedForeground} />
          <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
            {searchText ? "No results found" : "No knowledge entries yet"}
          </Text>
        </View>
      ) : viewMode === "grid" ? (
        <FlatList
          data={filtered}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={s.gridRow}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => mutate()} tintColor={colors.brandFrom} />
          }
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => mutate()} tintColor={colors.brandFrom} />
          }
        />
      )}

      {/* Bottom Sheet Detail */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        <Pressable style={s.sheetBackdrop} onPress={closeSheet}>
          <Animated.View
            style={[
              s.sheetContainer,
              {
                backgroundColor: colors.card,
                height: screenHeight * 0.7,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight * 0.7, 0],
                  }),
                }],
              },
            ]}
          >
            <Pressable onPress={() => {}} style={{ flex: 1 }}>
              {/* Drag handle */}
              <View style={s.sheetHandle}>
                <View style={[s.sheetHandleBar, { backgroundColor: colors.border }]} />
              </View>

              {/* Header: badge + close */}
              <View style={s.sheetHeader}>
                <View
                  style={[
                    s.typeBadge,
                    { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" },
                  ]}
                >
                  <FileText size={12} color={colors.brandFrom} />
                  <Text style={[s.typeBadgeText, { color: colors.brandFrom }]}>
                    {selectedItem?.type}
                  </Text>
                </View>
                <TouchableOpacity onPress={closeSheet} activeOpacity={0.7}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Title + time */}
              <View style={s.sheetTitleSection}>
                <Text style={[s.sheetTitle, { color: colors.foreground }]}>
                  {selectedItem?.title}
                </Text>
                <Text style={[s.sheetTime, { color: colors.textMuted }, mono]}>
                  {selectedItem ? formatRelativeTime(selectedItem.updatedAt) : ""}
                </Text>
              </View>

              {/* Divider */}
              <View style={[s.sheetDivider, { backgroundColor: colors.border + "40" }]} />

              {/* Content */}
              <ScrollView
                style={s.sheetContent}
                contentContainerStyle={s.sheetContentInner}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[s.sheetContentText, { color: colors.textSecondary }]}>
                  {selectedItem?.content}
                </Text>
              </ScrollView>

              {/* Tags */}
              {selectedItem && selectedItem.tags.length > 0 && (
                <>
                  <View style={[s.sheetDivider, { backgroundColor: colors.border + "40" }]} />
                  <View style={s.sheetTags}>
                    {selectedItem.tags.map((tag) => (
                      <Text key={tag} style={[s.tagText, { color: colors.textMuted }]}>
                        #{tag}
                      </Text>
                    ))}
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

// -- Grid Card Component --

function KnowledgeCardGrid({
  item,
  colors,
  onPress,
}: {
  item: Knowledge
  colors: ReturnType<typeof useColors>
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[s.gridCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[s.glowCircle, { backgroundColor: colors.brandFrom + "0D" }]} />

      {/* Badge + Time row */}
      <View style={[s.cardHeaderRow, { zIndex: 10 }]}>
        <View
          style={[
            s.typeBadge,
            { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" },
          ]}
        >
          <FileText size={12} color={colors.brandFrom} />
          <Text style={[s.typeBadgeText, { color: colors.brandFrom }]}>
            {item.type}
          </Text>
        </View>
        <Text style={[s.timeText, { color: colors.textMuted }]}>{formatRelativeTime(item.updatedAt)}</Text>
      </View>

      {/* Title */}
      <Text style={[s.gridCardTitle, { color: colors.foreground, zIndex: 10 }]}>
        {item.title}
      </Text>

      {/* Summary / Content preview */}
      <Text style={[s.gridCardDesc, { color: colors.textTertiary }]} numberOfLines={2}>
        {item.summary ?? item.content}
      </Text>

      {/* Tags */}
      {item.tags.length > 0 && (
        <View style={[s.tagsRow, { zIndex: 10, marginTop: "auto" }]}>
          {item.tags.map((tag) => (
            <Text key={tag} style={[s.tagText, { color: colors.textMuted }]}>
              #{tag}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  )
}

// -- List Card Component --

function KnowledgeCardList({
  item,
  colors,
  onPress,
}: {
  item: Knowledge
  colors: ReturnType<typeof useColors>
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[s.listCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[s.glowCircleList, { backgroundColor: colors.brandFrom + "0D" }]} />

      {/* Badge */}
      <View style={[s.listBadgeCol, { zIndex: 10 }]}>
        <View
          style={[
            s.typeBadge,
            { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" },
          ]}
        >
          <FileText size={12} color={colors.brandFrom} />
          <Text style={[s.typeBadgeText, { color: colors.brandFrom }]}>
            {item.type}
          </Text>
        </View>
      </View>

      {/* Title + Desc */}
      <View style={[s.listContentCol, { zIndex: 10 }]}>
        <Text style={[s.listCardTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[s.listCardDesc, { color: colors.textTertiary }]} numberOfLines={1}>
          {item.summary ?? item.content}
        </Text>
      </View>

      {/* Tags + Time */}
      <View style={[s.listMetaCol, { zIndex: 10 }]}>
        {item.tags.length > 0 && (
          <View style={s.tagsRow}>
            {item.tags.slice(0, 2).map((tag) => (
              <Text key={tag} style={[s.tagText, { color: colors.textMuted }]}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
        <Text style={[s.timeText, { color: colors.textMuted }]}>{formatRelativeTime(item.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },

  // Header section
  headerSection: {
    paddingHorizontal: 16,
    gap: 32,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.75,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // View toggle
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
  },
  toggleBtn: {
    padding: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
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
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Search bar
  searchContainer: {
    position: "relative",
  },
  searchIconLeft: {
    position: "absolute",
    left: 16,
    top: "50%",
    marginTop: -10,
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 48,
    paddingVertical: 14,
    fontSize: 14,
  },
  searchClearBtn: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -8,
    zIndex: 1,
  },

  // Loading / Empty
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center" },

  // List content
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 16,
  },
  gridRow: {
    gap: 16,
  },

  // Grid Card
  gridCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    overflow: "hidden",
    minHeight: 200,
  },

  // Glow circle
  glowCircle: {
    position: "absolute",
    right: -32,
    top: -32,
    width: 128,
    height: 128,
    borderRadius: 9999,
  },
  glowCircleList: {
    position: "absolute",
    right: -32,
    top: -32,
    width: 128,
    height: 128,
    borderRadius: 9999,
  },

  // Card header row
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Type badge
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },

  // Time text
  timeText: {
    fontSize: 10,
    ...mono,
  },

  // Grid card title
  gridCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  // Grid card desc
  gridCardDesc: {
    fontSize: 14,
    marginBottom: 16,
    zIndex: 10,
    flex: 1,
  },

  // Tags row
  tagsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tagText: {
    fontSize: 12,
    ...mono,
  },

  // List Card
  listCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  listCardDesc: {
    fontSize: 14,
  },

  // List meta column
  listMetaCol: {
    flexShrink: 0,
    alignItems: "flex-end",
    gap: 8,
  },

  // Bottom Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  sheetHandle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sheetTitleSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  sheetTime: {
    fontSize: 11,
  },
  sheetDivider: {
    height: 1,
    marginHorizontal: 20,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetContentInner: {
    paddingVertical: 16,
  },
  sheetContentText: {
    fontSize: 14,
    lineHeight: 22,
  },
  sheetTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
})
