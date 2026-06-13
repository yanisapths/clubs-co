export const effect = {
  blur: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
  },
  opacity: {
    xs: "0.04",
    sm: "0.08",
    md: "0.16",
    lg: "0.24",
    xl: "0.32",
    "2xl": "0.4",
    "3xl": "0.48",
    "4xl": "0.56",
    "5xl": "0.64",
    "6xl": "0.72",
    "7xl": "0.8",
    "8xl": "0.88",
  },
  gradient: {
    grey: {
      "45deg":
        "linear-gradient(45deg, var(--aster-color-grey-800), var(--aster-color-grey-600))",
      "90deg":
        "linear-gradient(90deg, var(--aster-color-grey-800), var(--aster-color-grey-600))",
      "180deg":
        "linear-gradient(180deg, var(--aster-color-grey-800), var(--aster-color-grey-800))",
    },
    brand: {
      "45deg":
        "linear-gradient(45deg, var(--aster-color-teal-500), var(--aster-color-sky-500))",
      "90deg":
        "linear-gradient(90deg, var(--aster-color-teal-500), var(--aster-color-sky-500))",
      "180deg":
        "linear-gradient(180deg, var(--aster-color-teal-500), var(--aster-color-sky-500))",
    },
    black: {
      "45deg":
        "linear-gradient(45deg, var(--aster-color-common-black), color-mix(in srgb, var(--aster-color-common-black) 0%, transparent))",
      "90deg":
        "linear-gradient(90deg, var(--aster-color-common-black), color-mix(in srgb, var(--aster-color-common-black) 0%, transparent))",
      "180deg":
        "linear-gradient(180deg, var(--aster-color-common-black), color-mix(in srgb, var(--aster-color-common-black) 0%, transparent))",
    },
    white: {
      "45deg":
        "linear-gradient(45deg, var(--aster-color-common-white), color-mix(in srgb, var(--aster-color-common-white) 0%, transparent))",
      "90deg":
        "linear-gradient(90deg, var(--aster-color-common-white), color-mix(in srgb, var(--aster-color-common-white) 0%, transparent))",
      "180deg":
        "linear-gradient(180deg, var(--aster-color-common-white), color-mix(in srgb, var(--aster-color-common-white) 0%, transparent))",
    },
    radial: {
      green:
        "radial-gradient(50% 50% at 50% 50%, rgba(19, 181, 121, 0.2) 0%, rgba(17, 17, 17, 0) 100%)",
      blue: "radial-gradient(50% 50% at 50% 50%, rgba(1, 131, 232, 0.2) 0%, rgba(17, 17, 17, 0) 100%)",
      mix: "linear-gradient(210.69deg, #34D1AD 7.54%, #0183E8 37.88%, rgba(125, 37, 237, 0.5) 82.58%)",
    },
    card: "linear-gradient(10deg, var(--aster-color-background-600) 0%, var(--aster-gradient-white-color) 50%, var(--aster-color-background-600) 100%)",
  },
  boxShadow: {
    "focus-ring": {
      primary: "0 0 0 4px var(--aster-color-teal-800)",
      danger: "0 0 0 4px var(--aster-color-red-800)",
    },
    round: {
      success:
        "0px 0px 0.3px 0px var(--aster-color-green-600), 0px 0px 0.6px 0px var(--aster-color-green-600), 0px 0px 2.1px 0px var(--aster-color-green-600), 0px 0px 4.2px 0px var(--aster-color-green-600), 0px 0px 7.21px 0px var(--aster-color-green-600), 0px 0px 12.61px 0px var(--aster-color-green-600)",
      danger:
        "0px 0px 0.3px 0px var(--aster-color-red-600), 0px 0px 0.6px 0px var(--aster-color-red-600), 0px 0px 2.1px 0px var(--aster-color-red-600), 0px 0px 4.2px 0px var(--aster-color-red-600), 0px 0px 7.21px 0px var(--aster-color-red-600), 0px 0px 12.61px 0px var(--aster-color-red-600)",
      warning:
        "0px 0px 0.3px 0px var(--aster-color-yellow-600), 0px 0px 0.6px 0px var(--aster-color-yellow-600), 0px 0px 2.1px 0px var(--aster-color-yellow-600), 0px 0px 4.2px 0px var(--aster-color-yellow-600), 0px 0px 7.21px 0px var(--aster-color-yellow-600), 0px 0px 12.61px 0px var(--aster-color-yellow-600)",
    },
  },
} as const;

const createBlurCssVariables = () =>
  Object.entries(effect.blur).map(
    ([key, value]) => `--aster-effect-blur-${key}: ${value}px;`,
  );

const createOpacityCssVariables = () =>
  Object.entries(effect.opacity).map(
    ([key, value]) => `--aster-effect-opacity-${key}: ${value};`,
  );

const createGradientCssVariables = () =>
  Object.entries(effect.gradient)
    .map(([key, value]) =>
      Object.entries(value).map(
        ([angel, subValue]) =>
          `--aster-effect-gradient-${key}-${angel}: ${subValue};`,
      ),
    )
    .flat();

export const createEffectCssVariables = () => [
  ...createBlurCssVariables(),
  ...createOpacityCssVariables(),
  ...createGradientCssVariables(),
];
