import { Tabs } from "expo-router";
import {
  Home,
  ArrowLeftRight,
  CreditCard,
  UserRound,
} from "lucide-react-native";

import { colors, typography } from "../../../src/theme/design-system";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.xxs,
        },

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Home
              size={size}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transações",
          tabBarIcon: ({ color, size }) => (
            <ArrowLeftRight
              size={size}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          title: "Cartões",
          tabBarIcon: ({ color, size }) => (
            <CreditCard
              size={size}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <UserRound
              size={size}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Tabs>
  );
}