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
import { useTheme } from "@/context/ThemeContext";
import { useAppData } from "@/context/AppDataContext";
import { PlayerProfile, POSITIONS, PLAYER_LEVELS, CITIES, AGE_GROUPS } from "@/lib/types";

export default function SetupProfileScreen() {
  const { colors } = useTheme();
  const { setProfile } = useAppData();

  const [name, setName] = useState("");
  const [position, setPosition] = useState(POSITIONS[0]);
  const [level, setLevel] = useState(PLAYER_LEVELS[0]);
  const [city, setCity] = useState("طرابلس");
  const [area, setArea] = useState("");
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[2]);
  const [showAgeGroup, setShowAgeGroup] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("يرجى إدخال الاسم");
      return;
    }
    if (!area.trim()) {
      setError("يرجى إدخال المنطقة");
      return;
    }

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

      setProfile(profile);
      router.replace("/(tabs)");
    } catch (e) {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>إعداد الملف الشخصي</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        أكمل بياناتك للبدء
      </Text>

      {!!error && (
        <View style={[styles.errorBox, { backgroundColor: colors.danger + "20" }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>الاسم</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="اكتب اسمك"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>المركز</Text>
        <View style={styles.pillsRow}>
          {POSITIONS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPosition(p)}
              style={[
                styles.pill,
                { backgroundColor: colors.card, borderColor: colors.border },
                position === p && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.text },
                  position === p && { color: "#FFFFFF" },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>المستوى</Text>
        <View style={styles.pillsRow}>
          {PLAYER_LEVELS.map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setLevel(l)}
              style={[
                styles.pill,
                { backgroundColor: colors.card, borderColor: colors.border },
                level === l && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
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

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>المدينة</Text>
        <View style={styles.pillsRow}>
          {CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCity(c)}
              style={[
                styles.pill,
                { backgroundColor: colors.card, borderColor: colors.border },
                city === c && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
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

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>المنطقة</Text>
        <TextInput
          value={area}
          onChangeText={setArea}
          placeholder="مثال: جنزور، سوق الجمعة..."
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>الفئة العمرية</Text>
        <View style={styles.pillsRow}>
          {AGE_GROUPS.map((a) => (
            <TouchableOpacity
              key={a}
              onPress={() => setAgeGroup(a)}
              style={[
                styles.pill,
                { backgroundColor: colors.card, borderColor: colors.border },
                ageGroup === a && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.text },
                  ageGroup === a && { color: "#FFFFFF" },
                ]}
              >
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.rowBetween]}>
        <View>
          <Text style={[styles.label, { color: colors.text }]}>إظهار الفئة العمرية</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            يمكنك إخفاؤها من الملف الشخصي
          </Text>
        </View>
        <Switch
          value={showAgeGroup}
          onValueChange={setShowAgeGroup}
          thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: colors.primary },
          isSubmitting && { opacity: 0.7 },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>حفظ</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", marginTop: 8 },
  subtitle: { marginTop: 6, fontSize: 14, marginBottom: 16 },
  section: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  hint: { fontSize: 12, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: { fontSize: 13, fontWeight: "700" },
  submitBtn: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  errorBox: { padding: 12, borderRadius: 12, marginBottom: 12 },
  errorText: { fontSize: 13, fontWeight: "700" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
