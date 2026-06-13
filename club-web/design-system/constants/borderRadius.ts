export const borderRadius = {
	none: 0,
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	full: 9999,
} as const

type BorderRadiusKey = keyof typeof borderRadius

export const createBorderRadiusCssVariables = () =>
	Object.entries(borderRadius).map(([key, value]) => `--aster-border-radius-${key}: ${value}px;`)

export const createBorderRadiusVariant = () => {
	const result: Record<string, string> = {}

	Object.entries(borderRadius).map(([key, value]) => {
		result[key] = `rounded-${value}`
	})

	return result as Record<BorderRadiusKey, string>
}
