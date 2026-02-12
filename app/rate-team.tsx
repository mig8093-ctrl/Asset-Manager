import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";

export default function RateTeamScreen() {
  const { matchId, teamId, teamName } = useLocalSearchParams<{
    matchId: string;
    teamId: string;
    teamName: string;
  }>();
  const { profile } = useAuth();
  const data = useData();
  const { colors } = useTheme();

  const [stars, setStars] = useState(0);
  const [note, setNote] = useState("");

  if (!profile || !matchId || !teamId) return null;

  const match = data.getMatch(matchId);
  const myTeams = data.getMyTeams(profile.id);
  const myTeamIds = myTeams.map((t) => t.id);

  let userTeamId = "";
  if (match) {
    if (myTeamIds.includes(match.homeTeamId)) {
      userTeamId = match.homeTeamId;
    } else if (match.awayTeamId && myTeamIds.includes(match.awayTeamId)) {
      userTeamId = match.awayTeamId;
    }
  }

  const handleSubmit = () => {
    if (stars === 0 || !userTeamId) return;
    data.addRating({
      matchId,
      fromTeamId: userTeamId,
      toTeamId: teamId,
      stars,
      note: note.trim() || undefined,
    });
    router.back();
  };

  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.grabber} />

      <Text style={styles.title}>تقييم الفريق</Text>
      <Text style={styles.teamName}>{teamName}</Text>

      <View style={styles.starsContainer}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setStars(i)}
              style={styles.starButton}
              testID={`star-${i}`}
            >
              <Ionicons
                name={i <= stars ? "star" : "star-outline"}
                size={44}
                color={colors.star}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>{stars} / 5</Text>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="أضف ملاحظة (اختياري)"
        placeholderTextColor={colors.textTertiary}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        textAlign="right"
      />

      <TouchableOpacity
        style={[styles.submitButton, stars === 0 && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={stars === 0}
        testID="submit-rating"
      >
        <Text style={styles.submitButtonText}>إرسال التقييم</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 24,
      alignItems: "center",
    },
    grabber: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.textTertiary,
      alignSelf: "center",
      marginBottom: 24,
      marginTop: 8,
    },
    title: {
      fontFamily: "Cairo_700Bold",
      fontSize: 22,
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
      writingDirection: "rtl",
    },
    teamName: {
      fontFamily: "Cairo_600SemiBold",
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 32,
      writingDirection: "rtl",
    },
    starsContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    starsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    starButton: {
      padding: 4,
    },
    ratingText: {
      fontFamily: "Cairo_600SemiBold",
      fontSize: 18,
      color: colors.textSecondary,
    },
    textInput: {
      width: "100%",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontFamily: "Cairo_400Regular",
      fontSize: 15,
      color: colors.text,
      height: 120,
      marginBottom: 24,
      writingDirection: "rtl",
      textAlign: "right",
    },
    submitButton: {
      width: "100%",
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontFamily: "Cairo_700Bold",
      fontSize: 17,
      color: "#FFFFFF",
    },
  });
