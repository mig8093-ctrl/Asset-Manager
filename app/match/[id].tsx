import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";
import { MATCH_STATUS_LABELS } from "@/lib/types";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const data = useData();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const match = data.getMatch(id ?? "");

  if (!match || !profile) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-forward" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            المباراة غير موجودة
          </Text>
        </View>
      </View>
    );
  }

  const isCreator = match.createdBy === profile.id;

  const awayTeam = match.awayTeamId ? data.getTeam(match.awayTeamId) : null;
  const isAwayTeamCaptain = awayTeam ? awayTeam.captainId === profile.id : false;

  const homeTeam = data.getTeam(match.homeTeamId);
  const isHomeTeamCaptain = homeTeam ? homeTeam.captainId === profile.id : false;

  const statusColor = {
    pending: colors.statusPending,
    confirmed: colors.statusConfirmed,
    finished: colors.statusFinished,
    cancelled: colors.statusCancelled,
  }[match.status];

  const handleAcceptChallenge = () => {
    data.respondChallenge(match.id, true);
    Alert.alert("تم", "تم قبول التحدي");
  };

  const handleRejectChallenge = () => {
    Alert.alert("رفض التحدي", "هل أنت متأكد من رفض هذا التحدي؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: () => {
          data.respondChallenge(match.id, false);
        },
      },
    ]);
  };

  const handleFinishMatch = () => {
    Alert.alert("إنهاء المباراة", "هل تريد إنهاء هذه المباراة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إنهاء",
        onPress: () => data.updateMatchStatus(match.id, "finished"),
      },
    ]);
  };

  const handleCancelMatch = () => {
    Alert.alert("إلغاء المباراة", "هل أنت متأكد من إلغاء هذه المباراة؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "إلغاء المباراة",
        style: "destructive",
        onPress: () => data.updateMatchStatus(match.id, "cancelled"),
      },
    ]);
  };

  const handleRateOpponent = () => {
    const myTeamId = isHomeTeamCaptain ? match.homeTeamId : match.awayTeamId;
    const opponentTeamId = isHomeTeamCaptain ? match.awayTeamId : match.homeTeamId;
    const opponentTeamName = isHomeTeamCaptain
      ? match.awayTeamName
      : match.homeTeamName;

    if (!opponentTeamId || !myTeamId) return;

    router.push({
      pathname: "/rate-team",
      params: {
        matchId: match.id,
        fromTeamId: myTeamId,
        toTeamId: opponentTeamId,
        toTeamName: opponentTeamName ?? "",
      },
    });
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
          تفاصيل المباراة
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/report",
              params: {
                targetType: "match",
                targetId: match.id,
                targetName: `${match.homeTeamName} vs ${match.awayTeamName ?? ""}`,
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
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {MATCH_STATUS_LABELS[match.status]}
            </Text>
          </View>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Text style={[styles.typeText, { color: colors.textSecondary }]}>
              {match.type === "challenge" ? "تحدي" : "مباراة مباشرة"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.vsCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.vsContainer}>
            <View style={styles.teamSide}>
              <Ionicons name="shield" size={32} color={colors.primary} />
              <Text
                style={[styles.vsTeamName, { color: colors.text }]}
                numberOfLines={2}
              >
                {match.homeTeamName}
              </Text>
            </View>

            <View
              style={[styles.vsMiddle, { backgroundColor: colors.primary + "15" }]}
            >
              <Text style={[styles.vsText, { color: colors.primary }]}>ضد</Text>
            </View>

            <View style={styles.teamSide}>
              <Ionicons
                name="shield"
                size={32}
                color={match.awayTeamName ? colors.accent : colors.textTertiary}
              />
              <Text
                style={[
                  styles.vsTeamName,
                  {
                    color: match.awayTeamName
                      ? colors.text
                      : colors.textTertiary,
                  },
                ]}
                numberOfLines={2}
              >
                {match.awayTeamName ?? "بدون خصم"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.detailsCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <DetailRow
            icon="calendar-outline"
            label={match.date}
            colors={colors}
          />
          <DetailRow
            icon="time-outline"
            label={match.time}
            colors={colors}
          />
          <DetailRow
            icon="location-outline"
            label={match.city}
            colors={colors}
          />
          {match.stadium && (
            <DetailRow
              icon="football-outline"
              label={match.stadium}
              colors={colors}
            />
          )}
          {match.notes && (
            <DetailRow
              icon="document-text-outline"
              label={match.notes}
              colors={colors}
            />
          )}
        </View>

        {match.locationUrl && (
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: colors.primary + "15" }]}
            onPress={() => Linking.openURL(match.locationUrl!)}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={[styles.mapButtonText, { color: colors.primary }]}>
              فتح الموقع في خرائط Google
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionsSection}>
          {match.type === "challenge" &&
            match.status === "pending" &&
            isAwayTeamCaptain && (
              <View style={styles.challengeActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={handleAcceptChallenge}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>قبول التحدي</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={handleRejectChallenge}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>رفض التحدي</Text>
                </TouchableOpacity>
              </View>
            )}

          {match.status === "confirmed" && isCreator && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleFinishMatch}
              activeOpacity={0.7}
            >
              <Ionicons name="flag" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>إنهاء المباراة</Text>
            </TouchableOpacity>
          )}

          {match.status === "finished" &&
            (isHomeTeamCaptain || isAwayTeamCaptain) &&
            match.awayTeamId && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                onPress={handleRateOpponent}
                activeOpacity={0.7}
              >
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>تقييم الخصم</Text>
              </TouchableOpacity>
            )}

          {isCreator &&
            match.status !== "cancelled" &&
            match.status !== "finished" && (
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.error + "15" },
                ]}
                onPress={handleCancelMatch}
                activeOpacity={0.7}
              >
                <Ionicons name="close-outline" size={20} color={colors.error} />
                <Text
                  style={[styles.cancelButtonText, { color: colors.error }]}
                >
                  إلغاء المباراة
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: any;
}) {
  return (
    <View style={detailStyles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[detailStyles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  label: {
    fontFamily: "Cairo_400Regular",
    fontSize: 15,
    flex: 1,
    textAlign: "right",
  },
});

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
  statusRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 16,
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
  },
  typeBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
  },
  vsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
  },
  vsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamSide: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  vsTeamName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    textAlign: "center",
  },
  vsMiddle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  vsText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  mapButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  mapButtonText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
  },
  actionsSection: {
    gap: 12,
    marginTop: 4,
  },
  challengeActions: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  cancelButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  cancelButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
  },
});
