import { useState, useMemo } from "react";
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
import type { MatchType } from "@/lib/types";
import { CITIES } from "@/lib/types";

export default function CreateMatchScreen() {
  const { profile } = useAuth();
  const data = useData();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [matchType, setMatchType] = useState<MatchType>("direct");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [awaySearch, setAwaySearch] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [stadium, setStadium] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [notes, setNotes] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!profile) return null;

  const myTeams = data.getMyTeams(profile.id);
  const selectedHomeTeam = myTeams.find((t) => t.id === homeTeamId);

  const filteredAwayTeams = useMemo(() => {
    if (!awaySearch.trim()) return [];
    return data.teams.filter(
      (t) =>
        t.id !== homeTeamId &&
        t.name.includes(awaySearch.trim())
    );
  }, [data.teams, homeTeamId, awaySearch]);

  const selectedAwayTeam = data.teams.find((t) => t.id === awayTeamId);

  const isValid =
    homeTeamId !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    city !== "" &&
    (matchType === "direct" || awayTeamId !== "");

  const handleSubmit = () => {
    if (!isValid || !selectedHomeTeam) return;

    if (matchType === "direct") {
      data.createMatch({
        type: "direct",
        homeTeamId,
        homeTeamName: selectedHomeTeam.name,
        date: date.trim(),
        time: time.trim(),
        city,
        stadium: stadium.trim() || undefined,
        locationUrl: locationUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        status: "confirmed",
        createdBy: profile.id,
      });
    } else {
      data.createMatch({
        type: "challenge",
        homeTeamId,
        homeTeamName: selectedHomeTeam.name,
        awayTeamId,
        awayTeamName: selectedAwayTeam?.name,
        date: date.trim(),
        time: time.trim(),
        city,
        stadium: stadium.trim() || undefined,
        locationUrl: locationUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        status: "pending",
        createdBy: profile.id,
      });
    }
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
          إنشاء مباراة
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
          <Text style={[styles.label, { color: colors.text }]}>نوع المباراة</Text>
          <View style={styles.typeCardsRow}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor:
                    matchType === "direct" ? colors.primary : colors.border,
                  borderWidth: matchType === "direct" ? 2 : 1,
                },
              ]}
              onPress={() => {
                setMatchType("direct");
                setAwayTeamId("");
                setAwaySearch("");
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="football-outline"
                size={32}
                color={matchType === "direct" ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeCardText,
                  {
                    color:
                      matchType === "direct" ? colors.primary : colors.text,
                  },
                ]}
              >
                مباراة مباشرة
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor:
                    matchType === "challenge" ? colors.primary : colors.border,
                  borderWidth: matchType === "challenge" ? 2 : 1,
                },
              ]}
              onPress={() => setMatchType("challenge")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trophy-outline"
                size={32}
                color={
                  matchType === "challenge" ? colors.primary : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.typeCardText,
                  {
                    color:
                      matchType === "challenge" ? colors.primary : colors.text,
                  },
                ]}
              >
                تحدي
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>الفريق</Text>
          {myTeams.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد فرق. أنشئ فريقاً أولاً.
            </Text>
          ) : (
            <View style={styles.chipsWrap}>
              {myTeams.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surfaceSecondary },
                    homeTeamId === t.id && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    setHomeTeamId(t.id);
                    if (awayTeamId === t.id) {
                      setAwayTeamId("");
                      setAwaySearch("");
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.text },
                      homeTeamId === t.id && { color: "#FFFFFF" },
                    ]}
                  >
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {matchType === "challenge" && (
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.text }]}>
              الفريق المنافس
            </Text>
            {selectedAwayTeam ? (
              <View
                style={[
                  styles.selectedAwayRow,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    setAwayTeamId("");
                    setAwaySearch("");
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
                <View style={styles.awayTeamInfo}>
                  <Text style={[styles.awayTeamName, { color: colors.text }]}>
                    {selectedAwayTeam.name}
                  </Text>
                  <Text
                    style={[styles.awayTeamMeta, { color: colors.textSecondary }]}
                  >
                    {selectedAwayTeam.city} · {selectedAwayTeam.level}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      color: colors.text,
                    },
                  ]}
                  value={awaySearch}
                  onChangeText={setAwaySearch}
                  placeholder="ابحث عن فريق..."
                  placeholderTextColor={colors.textTertiary}
                  textAlign="right"
                />
                {filteredAwayTeams.length > 0 && (
                  <View
                    style={[
                      styles.searchResults,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {filteredAwayTeams.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.searchResultRow,
                          { borderBottomColor: colors.borderLight },
                        ]}
                        onPress={() => {
                          setAwayTeamId(t.id);
                          setAwaySearch("");
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.searchResultInfo}>
                          <Text
                            style={[styles.searchResultName, { color: colors.text }]}
                          >
                            {t.name}
                          </Text>
                          <Text
                            style={[
                              styles.searchResultMeta,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {t.city}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.levelBadge,
                            { backgroundColor: colors.surfaceSecondary },
                          ]}
                        >
                          <Text
                            style={[styles.levelBadgeText, { color: colors.textSecondary }]}
                          >
                            {t.level}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>التاريخ</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              },
            ]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>الوقت</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              },
            ]}
            value={time}
            onChangeText={setTime}
            placeholder="HH:MM"
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
            الملعب (اختياري)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              },
            ]}
            value={stadium}
            onChangeText={setStadium}
            placeholder="اسم الملعب"
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            رابط الموقع (اختياري)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              },
            ]}
            value={locationUrl}
            onChangeText={setLocationUrl}
            placeholder="رابط خرائط Google"
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            ملاحظات (اختياري)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="أضف ملاحظات..."
            placeholderTextColor={colors.textTertiary}
            textAlign="right"
            multiline
            numberOfLines={3}
          />
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
          <Text style={styles.submitButtonText}>إنشاء المباراة</Text>
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeCardsRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  typeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 12,
    gap: 8,
  },
  typeCardText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
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
  emptyText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    textAlign: "right",
  },
  selectedAwayRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  awayTeamInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  awayTeamName: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
  },
  awayTeamMeta: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  searchResultRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchResultInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  searchResultName: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
  },
  searchResultMeta: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12,
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
