import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const { getMyTeams, getMyMatches } = useData();
  const { colors, theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!profile) return null;

  const initial = profile.name.charAt(0);
  const teamsCount = getMyTeams(profile.id).length;
  const matchesCount = getMyMatches(profile.id).length;

  const handleCopyId = async () => {
    try {
      const Clipboard = await import("expo-clipboard");
      await Clipboard.setStringAsync(profile.playerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <Text style={[styles.playerName, { color: colors.text }]}>
            {profile.name}
          </Text>

          <TouchableOpacity
            style={[styles.idBadge, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleCopyId}
            activeOpacity={0.7}
          >
            <Ionicons
              name={copied ? "checkmark" : "copy-outline"}
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.idText, { color: colors.textSecondary }]}>
              {copied ? "تم النسخ" : profile.playerId}
            </Text>
          </TouchableOpacity>

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {profile.position}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {profile.level}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {profile.city} - {profile.area || "—"}
            </Text>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoText, { color: colors.text }]}>
              {profile.showAgeGroup ? profile.ageGroup : "مخفي"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {teamsCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              الفرق
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {matchesCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              المباريات
            </Text>
          </View>
        </View>

        <View style={[styles.themeRow, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
          <View style={styles.themeTextRow}>
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              {theme === "dark" ? "الوضع الليلي" : "الوضع النهاري"}
            </Text>
            <Ionicons
              name={theme === "dark" ? "moon-outline" : "sunny-outline"}
              size={22}
              color={colors.text}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            تسجيل خروج
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportLink} activeOpacity={0.7}>
          <Text style={[styles.reportText, { color: colors.textSecondary }]}>
            الإبلاغ عن مشكلة
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 32,
    color: "#FFFFFF",
  },
  playerName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  idBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  idText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
  },
  badgesRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
  },
  infoSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  infoDivider: {
    height: 1,
    marginVertical: 10,
  },
  infoText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 15,
    flex: 1,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
  },
  statNumber: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
  },
  themeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  themeTextRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  themeLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  logoutText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
  },
  reportLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  reportText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
  },
});
