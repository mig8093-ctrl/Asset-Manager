import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import type { Match, MatchStatus } from "@/lib/types";
import { MATCH_STATUS_LABELS } from "@/lib/types";

type Filter = "all" | "upcoming" | "finished";

const FILTER_LABELS: Record<Filter, string> = {
  all: "الكل",
  upcoming: "القادمة",
  finished: "المنتهية",
};

export default function MatchesScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { getMyMatches } = useData();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const myMatches = useMemo(() => {
    if (!profile) return [];
    return getMyMatches(profile.playerId);
  }, [profile, getMyMatches]);

  const filteredMatches = useMemo(() => {
    if (filter === "all") return myMatches;
    if (filter === "upcoming")
      return myMatches.filter(
        (m) => m.status === "pending" || m.status === "confirmed"
      );
    return myMatches.filter((m) => m.status === "finished");
  }, [myMatches, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const getStatusColor = (status: MatchStatus): string => {
    switch (status) {
      case "pending":
        return colors.statusPending;
      case "confirmed":
        return colors.statusConfirmed;
      case "finished":
        return colors.statusFinished;
      case "cancelled":
        return colors.statusCancelled;
    }
  };

  const renderMatchCard = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => router.push(`/match/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                item.type === "direct"
                  ? colors.primary + "20"
                  : colors.accent + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.typeBadgeText,
              {
                color: item.type === "direct" ? colors.primary : colors.accent,
              },
            ]}
          >
            {item.type === "direct" ? "مباراة مباشرة" : "تحدي"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {MATCH_STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>

      <Text style={[styles.teamsText, { color: colors.text }]}>
        {item.homeTeamName} ضد {item.awayTeamName || "بدون خصم"}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {item.time}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {item.city}
          </Text>
        </View>
        {item.stadium ? (
          <View style={styles.infoItem}>
            <Ionicons
              name="football-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {item.stadium}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="football-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        لا توجد مباريات بعد
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <TouchableOpacity
          onPress={() => router.push("/create-match")}
          hitSlop={8}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          المباريات
        </Text>
      </View>

      <View style={styles.filterRow}>
        {(["all", "upcoming", "finished"] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === f ? colors.primary : colors.surfaceSecondary,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: filter === f ? "#FFFFFF" : colors.textSecondary,
                },
              ]}
            >
              {FILTER_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredMatches.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
  },
  filterRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
  },
  teamsText: {
    fontSize: 18,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row-reverse",
    gap: 16,
    marginBottom: 6,
  },
  infoItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "center",
  },
});
