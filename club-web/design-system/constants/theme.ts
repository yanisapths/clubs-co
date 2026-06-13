import { borderRadius } from "./borderRadius";
import { breakpoint } from "./breakpoint";
import { color, textColor } from "./color";
import { effect } from "./effect";
import { spacing } from "./spacing";
import { typography } from "./typography";

const themeColor = {
  white: color.common.white,
  black: color.common.black,

  label: textColor,

  ...color,

  primary: {
    ...color.teal,
    foreground: color.common.black,
    DEFAULT: color.teal[500],
  },
  secondary: {
    ...color.grey,
    foreground: color.common.white,
    DEFAULT: color.grey[400],
  },
  success: {
    ...color.green,
    foreground: color.common.black,
    DEFAULT: color.green[500],
  },
  warning: {
    ...color.yellow,
    foreground: color.common.black,
    DEFAULT: color.yellow[500],
  },
} as const;

const themeSpacing = {
  none: spacing.none + "px",
  xs: spacing.xs + "px",
  sm: spacing.sm + "px",
  md: spacing.md + "px",
  lg: spacing.lg + "px",
  xl: spacing.xl + "px",
  "2xl": spacing["2xl"] + "px",
  "3xl": spacing["3xl"] + "px",
  "4xl": spacing["4xl"] + "px",
  "5xl": spacing["5xl"] + "px",
  "6xl": spacing["6xl"] + "px",
  "7xl": spacing["7xl"] + "px",
  "8xl": spacing["8xl"] + "px",
  "9xl": spacing["9xl"] + "px",
} as const;

const themeBorderRadius = {
  none: borderRadius.none + "px",
  xs: borderRadius.xs + "px",
  sm: borderRadius.sm + "px",
  md: borderRadius.md + "px",
  lg: borderRadius.lg + "px",
  full: borderRadius.full + "px",
} as const;

const themeFontSize: Record<string, [string, string]> = {
  "display-lg": [
    typography.fontSize.larger.display.lg,
    typography.lineHeight.larger.display.lg,
  ],
  "display-md": [
    typography.fontSize.larger.display.md,
    typography.lineHeight.larger.display.md,
  ],
  "display-sm": [
    typography.fontSize.larger.display.sm,
    typography.lineHeight.larger.display.sm,
  ],
  "display-lg-mobile": [
    typography.fontSize.mobile.display.lg,
    typography.lineHeight.mobile.display.lg,
  ],
  "display-md-mobile": [
    typography.fontSize.mobile.display.md,
    typography.lineHeight.mobile.display.md,
  ],
  "display-sm-mobile": [
    typography.fontSize.mobile.display.sm,
    typography.lineHeight.mobile.display.sm,
  ],

  "heading-lg": [
    typography.fontSize.larger.heading.lg,
    typography.lineHeight.larger.heading.lg,
  ],
  "heading-md": [
    typography.fontSize.larger.heading.md,
    typography.lineHeight.larger.heading.md,
  ],
  "heading-sm": [
    typography.fontSize.larger.heading.sm,
    typography.lineHeight.larger.heading.sm,
  ],
  "heading-lg-mobile": [
    typography.fontSize.mobile.heading.lg,
    typography.lineHeight.mobile.heading.lg,
  ],
  "heading-md-mobile": [
    typography.fontSize.mobile.heading.md,
    typography.lineHeight.mobile.heading.md,
  ],
  "heading-sm-mobile": [
    typography.fontSize.mobile.heading.sm,
    typography.lineHeight.mobile.heading.sm,
  ],

  "text-lg": [
    typography.fontSize.larger.text.lg,
    typography.lineHeight.larger.text.lg,
  ],
  "text-md": [
    typography.fontSize.larger.text.md,
    typography.lineHeight.larger.text.md,
  ],
  "text-sm": [
    typography.fontSize.larger.text.sm,
    typography.lineHeight.larger.text.sm,
  ],
  "text-lg-mobile": [
    typography.fontSize.mobile.text.lg,
    typography.lineHeight.mobile.text.lg,
  ],
  "text-md-mobile": [
    typography.fontSize.mobile.text.md,
    typography.lineHeight.mobile.text.md,
  ],
  "text-sm-mobile": [
    typography.fontSize.mobile.text.sm,
    typography.lineHeight.mobile.text.sm,
  ],
};

const themefontWeight = {
  regular: typography.fontWeight.regular,
  semibold: typography.fontWeight.semibold,
  bold: typography.fontWeight.bold,
} as const;

const themeFontFamily = {
  sans: [typography.fontFamily.common],
  fancy: [typography.fontFamily.fancy],
};

const themeGradient = {
  "grey-45deg": effect.gradient.grey["45deg"],
  "grey-90deg": effect.gradient.grey["90deg"],
  "grey-180deg": effect.gradient.grey["180deg"],

  "brand-45deg": effect.gradient.brand["45deg"],
  "brand-90deg": effect.gradient.brand["90deg"],
  "brand-180deg": effect.gradient.brand["180deg"],

  "black-45deg": effect.gradient.black["45deg"],
  "black-90deg": effect.gradient.black["90deg"],
  "black-180deg": effect.gradient.black["180deg"],

  "white-45deg": effect.gradient.white["45deg"],
  "white-90deg": effect.gradient.white["90deg"],
  "white-180deg": effect.gradient.white["180deg"],

  "radial-green": effect.gradient.radial.green,
  "radial-blue": effect.gradient.radial.blue,
  "radial-mix": effect.gradient.radial.mix,

  card: effect.gradient.card,
} as const;

const themeBlur = {
  xs: effect.blur.xs + "px",
  sm: effect.blur.sm + "px",
  md: effect.blur.md + "px",
  lg: effect.blur.lg + "px",
  xl: effect.blur.xl + "px",
} as const;

const themeOpacity = {
  "4": effect.opacity.xs,
  "8": effect.opacity.sm,
  "16": effect.opacity.md,
  "24": effect.opacity.lg,
  "32": effect.opacity.xl,
  "40": effect.opacity["2xl"],
  "48": effect.opacity["3xl"],
  "56": effect.opacity["4xl"],
  "64": effect.opacity["5xl"],
  "72": effect.opacity["6xl"],
  "80": effect.opacity["7xl"],
  "88": effect.opacity["8xl"],
} as const;

const themeBoxShadow = {
  "focus-ring-primary": effect.boxShadow["focus-ring"].primary,
  "focus-ring-danger": effect.boxShadow["focus-ring"].danger,

  "round-success": effect.boxShadow["round"].success,
  "round-danger": effect.boxShadow["round"].danger,
  "round-warning": effect.boxShadow["round"].warning,
};

const themeBreakpoint = {
  sm: `${breakpoint.sm}px`,
  md: `${breakpoint.md}px`,
  lg: `${breakpoint.lg}px`,
};

export const theme = {
  color: themeColor,
  spacing: themeSpacing,
  borderRadius: themeBorderRadius,
  typography: {
    fontSize: themeFontSize,
    fontWeight: themefontWeight,
    fontFamily: themeFontFamily,
  },
  gradient: themeGradient,
  blur: themeBlur,
  opacity: themeOpacity,
  boxShadow: themeBoxShadow,
  screens: themeBreakpoint,
} as const;
