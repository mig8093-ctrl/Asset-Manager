import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const data = useData();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [invitePlayerId, setInvitePlayerId] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const team = data.getTeam(id ?? "");

  if (!team || !profile) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-forward" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            الفريق غير موجود
          </Text>
        </View>
      </View>
    );
  }

  const isCaptain = team.captainId === profile.id;

  const handleSendInvite = () => {
    const trimmed = invitePlayerId.trim();
    if (!trimmed) {
      Alert.alert("خطأ", "يرجى إدخال رقم اللاعب");
      return;
    }

    data.sendInvite({
      teamId: team.id,
      teamName: team.name,
      fromPlayerId: profile.id,
      fromPlayerName: profile.name,
      toPlayerId: trimmed,
    });

    Alert.alert("تم", "تم إرسال الدعوة");
    setInvitePlayerId("");
  };

  const handleDeleteTeam = () => {
    Alert.alert("حذف الفريق", "هل أنت متأكد من حذف الفريق؟ لا يمكن التراجع.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          data.deleteTeam(team.id);
          router.back();
        },
      },
    ]);
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert("إزالة لاعب", "هل تريد إزالة هذا اللاعب من الفريق؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: () => data.removeMember(team.id, memberId),
      },
    ]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={18}
          color={colors.star}
        />
      );
    }
    return stars;
  };

  const getMemberDisplay = (memberId: string) => {
    if (memberId === profile.id) {
      return {
        name: profile.name,
        initial: profile.name.charAt(0),
        position: profile.position,
        ageGroup: profile.showAgeGroup ? profile.ageGroup : null,
        isCaptain: team.captainId === memberId,
      };
    }
    return {
      name: `لاعب ${memberId.substring(0, 8)}`,
      initial: "ل",
      position: null,
      ageGroup: null,
      isCaptain: team.captainId === memberId,
    };
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 12, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          تفاصيل الفريق
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/report",
              params: {
                targetType: "team",
                targetId: team.id,
                targetName: team.name,
              },
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="flag-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.teamCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.teamName, { color: colors.text }]}>
            {team.name}
          </Text>

          <View style={styles.badgesRow}>
            <View
              style={[styles.badge, { backgroundColor: colors.primaryLight + "30" }]}
            >
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {team.city}
              </Text>
            </View>
            <View
              style={[styles.badge, { backgroundColor: colors.accent + "30" }]}
            >
              <Ionicons name="trophy" size={14} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent }]}>
                {team.level}
              </Text>
            </View>
            {isCaptain && (
              <View
                style={[styles.badge, { backgroundColor: colors.warning + "30" }]}
              >
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={[styles.badgeText, { color: colors.warning }]}>
                  الكابتن
                </Text>
              </View>
            )}
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>{renderStars(team.averageRating)}</View>
            <Text style={[styles.ratingNumber, { color: colors.text }]}>
              {team.averageRating.toFixed(1)}
            </Text>
            <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>
              ({team.totalRatings} تقييم)
            </Text>
          </View>
        </View>

        {isCaptain && (
          <View
            style={[
              styles.inviteSection,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              دعوة لاعب
            </Text>
            <View style={styles.inviteRow}>
              <TextInput
                style={[
                  styles.inviteInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    color: colors.text,
                    flex: 1,
                  },
                ]}
                value={invitePlayerId}
                onChangeText={setInvitePlayerId}
                placeholder="أدخل رقم اللاعب PL-XXXXXX"
                placeholderTextColor={colors.textTertiary}
                textAlign="right"
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={handleSendInvite}
                activeOpacity={0.7}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          style={[
            styles.membersSection,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            الأعضاء
          </Text>
          {team.memberIds.map((memberId) => {
            const member = getMemberDisplay(memberId);
            return (
              <View
                key={memberId}
                style={[styles.memberRow, { borderBottomColor: colors.borderLight }]}
              >
                <View style={styles.memberInfo}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: colors.primary + "25" },
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                      {member.initial}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <View style={styles.memberNameRow}>
                      <Text style={[styles.memberName, { color: colors.text }]}>
                        {member.name}
                      </Text>
                      {member.isCaptain && (
                        <Ionicons
                          name="star"
                          size={14}
                          color={colors.warning}
                          style={{ marginRight: 6 }}
                        />
                      )}
                    </View>
                    <View style={styles.memberBadges}>
                      {member.position && (
                        <View
                          style={[
                            styles.smallBadge,
                            { backgroundColor: colors.surfaceSecondary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.smallBadgeText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {member.position}
                          </Text>
                        </View>
                      )}
                      {member.ageGroup && (
                        <View
                          style={[
                            styles.smallBadge,
                            { backgroundColor: colors.surfaceSecondary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.smallBadgeText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {member.ageGroup}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {isCaptain && !member.isCaptain && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(memberId)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {isCaptain && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error + "15" }]}
            onPress={handleDeleteTeam}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[styles.deleteButtonText, { color: colors.error }]}>
              حذف الفريق
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
  },
  teamCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  teamName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row-reverse",
    gap: 2,
  },
  ratingNumber: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
  },
  ratingCount: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
  },
  inviteSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    textAlign: "right",
    marginBottom: 12,
  },
  inviteRow: {
    flexDirection: "row-reverse",
    gap: 10,
    alignItems: "center",
  },
  inviteInput: {
    borderRadius: 12,
    padding: 14,
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  membersSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  memberRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  memberName: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    textAlign: "right",
  },
  memberBadges: {
    flexDirection: "row-reverse",
    gap: 6,
    marginTop: 4,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  smallBadgeText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  deleteButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
  },
});
