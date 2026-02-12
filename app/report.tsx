import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { useTheme } from "@/lib/theme-context";
import { REPORT_REASONS } from "@/lib/types";

export default function ReportScreen() {
  const { targetType, targetId, targetName } = useLocalSearchParams<{
    targetType: string;
    targetId: string;
    targetName: string;
  }>();
  const { profile } = useAuth();
  const data = useData();
  const { colors } = useTheme();

  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");

  if (!profile || !targetType || !targetId) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    data.addReport({
      reporterId: profile.id,
      reporterName: profile.name,
      targetType: targetType as "team" | "player" | "match",
      targetId,
      targetName: targetName || "",
      reason: selectedReason,
      details: details.trim() || undefined,
    });
    Alert.alert("", "تم إرسال البلاغ بنجاح", [
      { text: "حسناً", onPress: () => router.back() },
    ]);
  };

  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.grabber} />

      <Text style={styles.title}>إبلاغ</Text>
      <Text style={styles.subtitle}>الإبلاغ عن: {targetName}</Text>

      <View style={styles.reasonsList}>
        {REPORT_REASONS.map((reason) => {
          const isSelected = selectedReason === reason;
          return (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
              onPress={() => setSelectedReason(reason)}
              testID={`reason-${reason}`}
            >
              <Ionicons
                name={isSelected ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={isSelected ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.reasonText,
                  isSelected && { color: colors.primary },
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="تفاصيل إضافية (اختياري)"
        placeholderTextColor={colors.textTertiary}
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        textAlign="right"
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          !selectedReason && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!selectedReason}
        testID="submit-report"
      >
        <Text style={styles.submitButtonText}>إرسال البلاغ</Text>
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
    subtitle: {
      fontFamily: "Cairo_600SemiBold",
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      writingDirection: "rtl",
    },
    reasonsList: {
      marginBottom: 24,
      gap: 4,
    },
    reasonRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reasonRowSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceSecondary,
    },
    reasonText: {
      fontFamily: "Cairo_600SemiBold",
      fontSize: 15,
      color: colors.text,
      writingDirection: "rtl",
      flex: 1,
      textAlign: "right",
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
      backgroundColor: colors.error,
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
