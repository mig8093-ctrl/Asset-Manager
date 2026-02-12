import React, { useMemo, useState, useCallback } from "react";
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
import type { Team, TeamInvite } from "@/lib/types";

export default function TeamsScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { getMyTeams, getMyInvites, respondInvite } = useData();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const myTeams = useMemo(() => {
    if (!profile) return [];
    return getMyTeams(profile.playerId);
  }, [profile, getMyTeams]);

  const myInvites = useMemo(() => {
    if (!profile) return [];
    return getMyInvites(profile.playerId);
  }, [profile, getMyInvites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={14}
          color={colors.star}
        />
      );
    }
    return stars;
  };

  const renderInviteCard = ({ item }: { item: TeamInvite }) => (
    <View
      style={[
        styles.inviteCard,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.inviteInfo}>
        <Text style={[styles.inviteTeamName, { color: colors.text }]}>
          {item.teamName}
        </Text>
        <Text style={[styles.inviteFromName, { color: colors.textSecondary }]}>
          من: {item.fromPlayerName}
        </Text>
      </View>
      <View style={styles.inviteActions}>
        <TouchableOpacity
          onPress={() => respondInvite(item.id, true)}
          hitSlop={8}
        >
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => respondInvite(item.id, false)}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={32} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTeamCard = ({ item }: { item: Team }) => {
    const isCaptain = profile?.playerId === item.captainId;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        activeOpacity={0.7}
        onPress={() =>
          router.push({ pathname: "/team/[id]" as any, params: { id: item.id } })
        }
      >
        <Text style={[styles.teamName, { color: colors.text }]}>
          {item.name}
        </Text>

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {item.city}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {item.level}
            </Text>
          </View>
          {isCaptain && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.warning + "20" },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.warning }]}>
                كابتن
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.membersRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.membersText, { color: colors.textSecondary }]}
            >
              {item.memberIds.length}
            </Text>
          </View>
          <View style={styles.starsRow}>{renderStars(item.averageRating)}</View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {myInvites.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            الدعوات
          </Text>
          {myInvites.map((invite) => (
            <View key={invite.id}>
              {renderInviteCard({ item: invite })}
            </View>
          ))}
        </View>
      )}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>الفرق</Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        لا توجد فرق بعد
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/create-team" as any)}
      >
        <Text style={styles.createButtonText}>أنشئ فريقك الأول</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <TouchableOpacity
          onPress={() => router.push("/create-team" as any)}
          hitSlop={8}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>فرقي</Text>
      </View>

      <FlatList
        data={myTeams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeamCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          myTeams.length === 0 && styles.listContentEmpty,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
    marginBottom: 10,
  },
  inviteCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  inviteInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  inviteTeamName: {
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
  },
  inviteFromName: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    marginTop: 2,
  },
  inviteActions: {
    flexDirection: "row",
    gap: 12,
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
  teamName: {
    fontSize: 18,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
  },
  cardFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  membersRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  membersText: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
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
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontFamily: "Cairo_700Bold",
    color: "#FFFFFF",
  },
});
