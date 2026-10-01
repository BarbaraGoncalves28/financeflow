import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { ArrowRight } from "lucide-react-native";

import { colors, radii, shadows, typography } from "../../theme/design-system";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  showArrow = true,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          minHeight: 56,
          borderRadius: radii.xl,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 20,
          opacity: isDisabled ? 0.7 : pressed ? 0.9 : 1,
          ...shadows.primary,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Text
            style={[
              {
                color: "#FFFFFF",
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.base,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>

          {showArrow && (
            <ArrowRight
              size={18}
              color="#FFFFFF"
              strokeWidth={2}
            />
          )}
        </>
      )}
    </Pressable>
  );
}