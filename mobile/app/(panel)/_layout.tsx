import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

import { colors } from "../../src/theme/design-system";
import { getCurrentUser } from "../../src/services/auth";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export default function PanelLayout() {
  const [authState, setAuthState] =
    useState<AuthState>("loading");

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      try {
        await getCurrentUser();

        if (mounted) {
          setAuthState("authenticated");
        }
      } catch {
        if (mounted) {
          setAuthState("unauthenticated");
        }
      }
    }

    validateSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (authState === "loading") {
    return null;
  }

  if (authState === "unauthenticated") {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}