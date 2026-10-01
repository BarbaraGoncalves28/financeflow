
import type { TextStyle, ViewStyle } from "react-native";

/**
 * FinanceFlow — Design System
 * Identidade visual centralizada do aplicativo.
 *
 * Os valores de espaçamento, dimensões, raios e sombras
 * são tokens iniciais, que serão refinados durante a
 * validação das telas com o protótipo visual.
 */

export const colors = {
  background: "#070C18",
  backgroundElevated: "#0D1425",
  surface: "#0D1425",
  surfaceElevated: "#141E35",
  surfaceInput: "#1A2540",

  text: "#EEF2FF",
  textSecondary: "#8B9CC8",
  textMuted: "#4A5578",
  textInverse: "#070C18",

  primary: "#7C6AF7",
  primaryLight: "#A99BFF",
  primaryDark: "#5B4AD6",
  secondary: "#5B8AF7",

  success: "#00C9A7",
  successDark: "#00A86B",
  danger: "#FF4F6B",
  dangerDark: "#FF2D55",
  warning: "#FFB347",
  warningDark: "#FF8C00",
  info: "#38BDF8",
  purple: "#A855F7",

  border: "rgba(139, 156, 200, 0.12)",
  borderSubtle: "rgba(139, 156, 200, 0.07)",
  borderDefault: "rgba(139, 156, 200, 0.18)",
  borderStrong: "rgba(139, 156, 200, 0.3)",
  borderFocused: "rgba(124, 106, 247, 0.6)",

  overlay: "rgba(7, 12, 24, 0.7)",
  overlayStrong: "rgba(0, 0, 0, 0.5)",

  income: "#00C9A7",
  expense: "#FF4F6B",
  transfer: "#7C6AF7",

  chart: {
    purple: "#7C6AF7",
    blue: "#5B8AF7",
    green: "#00C9A7",
    red: "#FF4F6B",
    amber: "#FFB347",
    cyan: "#38BDF8",
    pink: "#F472B6",
    indigo: "#818CF8",
  },

  banks: {
    nubank: "#820AD1",
    itau: "#EC7000",
    inter: "#FF8700",
  },
} as const;

export const typography = {
  fontFamily: {
    regular: "PlusJakartaSans-Regular",
    light: "PlusJakartaSans-Light",
    medium: "PlusJakartaSans-Medium",
    semiBold: "PlusJakartaSans-SemiBold",
    bold: "PlusJakartaSans-Bold",
    extraBold: "PlusJakartaSans-ExtraBold",
    mono: "JetBrainsMono-Regular",
    monoMedium: "JetBrainsMono-Medium",
    monoSemiBold: "JetBrainsMono-SemiBold",
  },

  fontSize: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 40,
    display: 48,
  },

  fontWeight: {
    light: "300",
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
    extraBold: "800",
  } as const,

  lineHeight: {
    tight: 16,
    snug: 20,
    normal: 24,
    relaxed: 28,
    loose: 32,
    heading: 36,
    display: 48,
  },

  letterSpacing: {
    tighter: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
  },
} as const;

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  card: 20,
  button: 14,
  input: 12,
  pill: 999,
  full: 9999,
} as const;

export const shadows = {
  none: {
    elevation: 0,
    shadowOpacity: 0,
  },

  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },

  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },

  primary: {
    shadowColor: "#7C6AF7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>;

export const gradients = {
  primary: {
    colors: ["#7C6AF7", "#5B8AF7"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  success: {
    colors: ["#00C9A7", "#00A86B"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  danger: {
    colors: ["#FF4F6B", "#FF2D55"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  warning: {
    colors: ["#FFB347", "#FF8C00"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  nubank: {
    colors: ["#820AD1", "#5A0092"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  itau: {
    colors: ["#EC7000", "#C45C00"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  inter: {
    colors: ["#FF8700", "#D46F00"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export const components = {
  screen: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing[5],
  } satisfies ViewStyle,

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing[4],
  } satisfies ViewStyle,

  elevatedCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderDefault,
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing[4],
    ...shadows.md,
  } satisfies ViewStyle,

  glassCard: {
    backgroundColor: "rgba(13, 20, 37, 0.8)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing[4],
  } satisfies ViewStyle,

  primaryButton: {
    minHeight: 48,
    borderRadius: radii.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[5],
    backgroundColor: colors.primary,
  } satisfies ViewStyle,

  secondaryButton: {
    minHeight: 48,
    borderRadius: radii.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[5],
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  } satisfies ViewStyle,

  input: {
    minHeight: 48,
    borderRadius: radii.input,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    color: colors.text,
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: typography.fontSize.sm,
  } satisfies TextStyle,

  heading: {
    color: colors.text,
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.heading,
  } satisfies TextStyle,

  body: {
    color: colors.text,
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
  } satisfies TextStyle,

  caption: {
    color: colors.textSecondary,
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.snug,
  } satisfies TextStyle,

  financialValue: {
    color: colors.text,
    fontFamily: "JetBrainsMono-SemiBold",
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.heading,
  } satisfies TextStyle,

  badge: {
    minHeight: 26,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  divider: {
    height: 1,
    backgroundColor: colors.border,
  } satisfies ViewStyle,

  progressTrack: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: "rgba(139, 156, 200, 0.12)",
    overflow: "hidden",
  } satisfies ViewStyle,

  bottomNavigation: {
    backgroundColor: "rgba(7, 12, 24, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 156, 200, 0.10)",
    paddingHorizontal: spacing[3],
  } satisfies ViewStyle,

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(7, 12, 24, 0.7)",
  } satisfies ViewStyle,
} as const;

const designSystem = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  gradients,
  components,
};

export default designSystem;
