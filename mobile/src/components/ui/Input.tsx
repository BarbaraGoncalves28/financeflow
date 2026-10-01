import React, { useState } from "react";
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import {
  colors,
  radii,
  typography,
} from "../../theme/design-system";

type InputProps = TextInputProps & {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  secure?: boolean;
};

export function Input({
  label,
  secure = false,
  containerStyle,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secure;

  return (
    <View style={[{ width: "100%" }, containerStyle]}>
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.xs,
          marginBottom: 6,
          letterSpacing: 0.2,
        }}
      >
        {label.toUpperCase()}
      </Text>

      <View style={{ position: "relative" }}>
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.textMuted}
          style={{
            minHeight: 54,
            width: "100%",
            borderRadius: radii.input,
            backgroundColor: "rgba(26, 37, 64, 0.8)",
            borderWidth: 1,
            borderColor: colors.borderDefault,
            color: colors.text,
            fontFamily: typography.fontFamily.regular,
            fontSize: typography.fontSize.sm,
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingRight: isPassword ? 52 : 16,
          }}
        />

        {isPassword && (
          <TextInputPasswordToggle
            visible={showPassword}
            onPress={() => setShowPassword((current) => !current)}
          />
        )}
      </View>
    </View>
  );
}

type TextInputPasswordToggleProps = {
  visible: boolean;
  onPress: () => void;
};

function TextInputPasswordToggle({
  visible,
  onPress,
}: TextInputPasswordToggleProps) {
  return (
    <View
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 52,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        onPress={onPress}
        suppressHighlighting
        style={{
          padding: 10,
        }}
      >
        {visible ? (
          <EyeOff size={18} color={colors.textMuted} />
        ) : (
          <Eye size={18} color={colors.textMuted} />
        )}
      </Text>
    </View>
  );
}