import React from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-context";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "search-outline", label: "البحث عن ملاعب قريبة" },
  { icon: "pricetag-outline", label: "مقارنة الأسعار" },
  { icon: "star-outline", label: "تقييمات اللاعبين" },
  { icon: "calendar-outline", label: "حجز مباشر" },
];

export default function StadiumsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topInset },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name="football-outline"
          size={80}
          color={colors.primary}
          style={{ opacity: 0.5 }}
        />

        <Text style={[styles.title, { color: colors.text }]}>الملاعب</Text>

        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>قريباً</Text>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          نعمل على إضافة:
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map((feature) => (
            <View key={feature.label} style={styles.featureRow}>
              <Ionicons
                name={feature.icon}
                size={20}
                color={colors.primary}
              />
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                {feature.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Cairo_700Bold",
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
  },
  badgeText: {
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
    color: "#FFFFFF",
  },
  description: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    marginTop: 16,
  },
  featureList: {
    gap: 14,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Cairo_400Regular",
  },
});
