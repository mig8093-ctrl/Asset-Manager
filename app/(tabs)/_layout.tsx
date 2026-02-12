import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import React from "react";
import { useTheme } from "@/lib/theme-context";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "sportscourt", selected: "sportscourt.fill" }} />
        <Label>المباريات</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="teams">
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
        <Label>الفرق</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="market">
        <Icon sf={{ default: "person.badge.plus", selected: "person.badge.plus" }} />
        <Label>السوق</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stadiums">
        <Icon sf={{ default: "building.2", selected: "building.2.fill" }} />
        <Label>الملاعب</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>حسابي</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: Platform.OS === "web" ? "relative" as const : "absolute" as const,
          backgroundColor:
            Platform.OS === "web"
              ? colors.surface
              : Platform.OS === "android"
                ? colors.surface
                : "transparent",
          borderTopWidth: Platform.OS === "web" ? 1 : 0,
          borderTopColor: Platform.OS === "web" ? colors.border : undefined,
          height: Platform.OS === "web" ? 84 : undefined,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={colors.background === "#0B1120" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : Platform.OS === "web" ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "المباريات",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "football" : "football-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: "الفرق",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "السوق",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-add" : "person-add-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stadiums"
        options={{
          title: "الملاعب",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "business" : "business-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "حسابي",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
