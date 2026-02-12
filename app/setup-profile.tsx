import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import type { Position, PlayerLevel, AgeGroup, PlayerProfile } from "@/lib/types";
import { POSITIONS, PLAYER_LEVELS, CITIES, AGE_GROUPS } from "@/lib/types";

export default function SetupProfileScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("وسط");
  const [level, setLevel] = useState<PlayerLevel>("متوسط");
  const [city, setCity] = useState("المدينة");
  const [area, setArea] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("18-24");
  const [showAgeGroup, setShowAgeGroup] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const playerId =
        "PL-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      const profile: PlayerProfile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        playerId,
        name: name.trim(),
        position,
        level,
        city,
        area: area.trim(),
        ageGroup,
        showAgeGroup,
        createdAt: new Date().toISOString(),
      };
      await login(profile);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChips = <T extends string>(
    items: readonly T[],
    selected: T,
    onSelect: (item: T) => void
  ) => (
    <View style={styles.chipsContainer}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.chip,
            { backgroundColor: colors.surfaceSecondary },
            selected === item && { backgroundColor: colors.primary },
          ]}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.text },
              selected === item && { color: "#FFFFFF" },
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 20, paddingBottom: bottomInset + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text }]}>
          أكمل ملفك الشخصي
        </Text>
        <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
          عرّفنا على نفسك
        </Text>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>اسم اللاعب</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="أدخل اسمك"
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>المركز</Text>
          {renderChips(POSITIONS, position, setPosition)}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>المستوى</Text>
          {renderChips(PLAYER_LEVELS, level, setLevel)}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>المدينة</Text>
          <View style={styles.chipsWrap}>
            {CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceSecondary },
                  city === c && { backgroundColor: colors.primary },
                ]}
                onPress={() => setCity(c)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.text },
                    city === c && { color: "#FFFFFF" },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            المنطقة/الحي
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              },
            ]}
            value={area}
            onChangeText={setArea}
            placeholder="أدخل المنطقة أو الحي"
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            الفئة العمرية
          </Text>
          {renderChips(AGE_GROUPS, ageGroup, setAgeGroup)}
        </View>

        <View style={styles.toggleRow}>
          <Switch
            value={showAgeGroup}
            onValueChange={setShowAgeGroup}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            إظهار الفئة العمرية
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            !name.trim() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>تسجيل</Text>
          )}
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
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    textAlign: "right",
    marginBottom: 4,
  },
  subtitleText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 16,
    textAlign: "right",
    marginBottom: 28,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
    textAlign: "right",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontFamily: "Cairo_400Regular",
    fontSize: 16,
    textAlign: "right",
  },
  chipsContainer: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  chipsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 28,
  },
  toggleLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});
