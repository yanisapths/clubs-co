export const spacing = {
	none: 0,
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	'2xl': 24,
	'3xl': 32,
	'4xl': 40,
	'5xl': 48,
	'6xl': 64,
	'7xl': 80,
	'8xl': 96,
	'9xl': 120,
} as const

export const createSpacingCssVariables = () =>
	Object.entries(spacing).map(([key, value]) => `--aster-spacing-${key}: ${value}px;`)
