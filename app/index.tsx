import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

const FEATURES = [
  { icon: "account-group" as const, label: "أنشئ فريقك" },
  { icon: "trophy" as const, label: "تحدَّ الفرق" },
  { icon: "map-marker" as const, label: "اكتشف الملاعب" },
];

export default function WelcomeScreen() {
  const { isLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn]);

  if (isLoggedIn) {
    return null;
  }

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={["#064E3B", "#059669", "#10B981"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View
        style={[
          styles.container,
          { paddingTop: topInset + 40, paddingBottom: bottomInset + 20 },
        ]}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="soccer" size={80} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>KoraLink</Text>
          <Text style={styles.subtitle}>نظّم مبارياتك بسهولة</Text>
        </View>

        <View style={styles.featuresSection}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <MaterialCommunityIcons
                name={feature.icon}
                size={28}
                color="#FFFFFF"
              />
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.85}
            onPress={() => router.push("/setup-profile")}
          >
            <Text style={styles.startButtonText}>ابدأ الآن</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  heroSection: {
    alignItems: "center",
    marginTop: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  appName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 42,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  featuresSection: {
    gap: 12,
  },
  featureCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  featureText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "right",
  },
  bottomSection: {
    marginTop: 20,
  },
  startButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    color: "#059669",
  },
});
