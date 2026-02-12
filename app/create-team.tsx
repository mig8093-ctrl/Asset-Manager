import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";
import type { TeamLevel } from "@/lib/types";
import { CITIES, TEAM_LEVELS } from "@/lib/types";

export default function CreateTeamScreen() {
  const { profile } = useAuth();
  const data = useData();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState<TeamLevel>("متوسط");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!profile) return null;

  const isValid = name.trim() !== "" && city !== "";

  const handleSubmit = () => {
    if (!isValid) return;
    data.createTeam({
      name: name.trim(),
      city,
      level,
      captainId: profile.id,
      memberIds: [profile.id],
    });
    router.back();
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
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          إنشاء فريق
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>اسم الفريق</Text>
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
            placeholder="أدخل اسم الفريق"
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
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
            مستوى الفريق
          </Text>
          <View style={styles.chipsContainer}>
            {TEAM_LEVELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceSecondary },
                  level === l && { backgroundColor: colors.primary },
                ]}
                onPress={() => setLevel(l)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.text },
                    level === l && { color: "#FFFFFF" },
                  ]}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            !isValid && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={!isValid}
        >
          <Text style={styles.submitButtonText}>إنشاء</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 20,
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
  submitButton: {
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
