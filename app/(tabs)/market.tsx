import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import type { FreeAgent, Position } from "@/lib/types";
import { POSITIONS, CITIES } from "@/lib/types";

const POSITION_COLORS: Record<Position, string> = {
  حارس: "#EF4444",
  دفاع: "#3B82F6",
  وسط: "#10B981",
  هجوم: "#F59E0B",
};

export default function MarketScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { getActiveFreeAgents, toggleFreeAgent, isPlayerFreeAgent } = useData();
  const insets = useSafeAreaInsets();
  const [positionFilter, setPositionFilter] = useState<string>("الكل");
  const [cityFilter, setCityFilter] = useState<string>("الكل");
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const isFreeAgent = useMemo(() => {
    if (!profile) return false;
    return isPlayerFreeAgent(profile.playerId);
  }, [profile, isPlayerFreeAgent]);

  const activeFreeAgents = useMemo(() => {
    let agents = getActiveFreeAgents();
    if (positionFilter !== "الكل") {
      agents = agents.filter((a) => a.position === positionFilter);
    }
    if (cityFilter !== "الكل") {
      agents = agents.filter((a) => a.city === cityFilter);
    }
    return agents;
  }, [getActiveFreeAgents, positionFilter, cityFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleToggle = () => {
    if (!profile) return;
    if (isFreeAgent) {
      toggleFreeAgent({
        playerId: profile.playerId,
        playerName: profile.name,
        position: profile.position,
        city: profile.city,
        area: profile.area,
        level: profile.level,
      });
      setShowForm(false);
      setNote("");
    } else if (showForm) {
      toggleFreeAgent({
        playerId: profile.playerId,
        playerName: profile.name,
        position: profile.position,
        city: profile.city,
        area: profile.area,
        level: profile.level,
        note: note || undefined,
      });
      setShowForm(false);
      setNote("");
    } else {
      setShowForm(true);
    }
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "انتهى";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "أقل من ساعة";
    return `${hours} ساعة`;
  };

  const renderFreeAgentCard = ({ item }: { item: FreeAgent }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.playerName, { color: colors.text }]}>
          {item.playerName}
        </Text>
        <Text style={[styles.timeText, { color: colors.textTertiary }]}>
          {getTimeRemaining(item.expiresAt)}
        </Text>
      </View>

      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: POSITION_COLORS[item.position] + "20" },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: POSITION_COLORS[item.position] },
            ]}
          >
            {item.position}
          </Text>
        </View>
        <View
          style={[styles.badge, { backgroundColor: colors.accent + "20" }]}
        >
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            {item.level}
          </Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Ionicons
          name="location-outline"
          size={14}
          color={colors.textSecondary}
        />
        <Text style={[styles.locationText, { color: colors.textSecondary }]}>
          {item.city} - {item.area}
        </Text>
      </View>

      {item.note ? (
        <Text style={[styles.noteText, { color: colors.textSecondary }]}>
          {item.note}
        </Text>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="person-add-outline"
        size={64}
        color={colors.textTertiary}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        لا يوجد لاعبون متاحون حالياً
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <>
      <View style={styles.toggleSection}>
        {isFreeAgent ? (
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: colors.success + "20" }]}
            onPress={handleToggle}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.toggleText, { color: colors.success }]}>
              أنت متاح
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: colors.primary + "20" },
            ]}
            onPress={handleToggle}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {showForm ? "تأكيد" : "اجعل نفسك متاحاً"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showForm && !isFreeAgent && (
        <View style={styles.formSection}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
                borderColor: colors.border,
                textAlign: "right",
              },
            ]}
            placeholder="مثلاً: حارس متاح اليوم"
            placeholderTextColor={colors.textTertiary}
            value={note}
            onChangeText={setNote}
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {["الكل", ...POSITIONS].map((pos) => (
          <TouchableOpacity
            key={pos}
            style={[
              styles.chip,
              {
                backgroundColor:
                  positionFilter === pos
                    ? colors.primary
                    : colors.surfaceSecondary,
              },
            ]}
            onPress={() => setPositionFilter(pos)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    positionFilter === pos ? "#FFFFFF" : colors.textSecondary,
                },
              ]}
            >
              {pos}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {["الكل", ...CITIES].map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.chip,
              {
                backgroundColor:
                  cityFilter === city
                    ? colors.primary
                    : colors.surfaceSecondary,
              },
            ]}
            onPress={() => setCityFilter(city)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    cityFilter === city ? "#FFFFFF" : colors.textSecondary,
                },
              ]}
            >
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>السوق</Text>
      </View>

      <FlatList
        data={activeFreeAgents}
        keyExtractor={(item) => item.id}
        renderItem={renderFreeAgentCard}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          activeFreeAgents.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
  },
  toggleSection: {
    marginBottom: 12,
  },
  toggleButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: "Cairo_700Bold",
  },
  formSection: {
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    borderWidth: 1,
  },
  chipScroll: {
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Cairo_600SemiBold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
  },
  badgeRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
  },
  locationRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
  },
  noteText: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    fontStyle: "italic",
    textAlign: "right",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "center",
  },
});
