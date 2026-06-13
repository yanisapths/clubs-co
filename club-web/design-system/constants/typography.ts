export const fontSizes = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 20,
	xl: 24,
	['2xl']: 32,
	['3xl']: 36,
	['4xl']: 40,
	['5xl']: 48,
	['6xl']: 62,
} as const

export const lineHeights = {
	xs: 16,
	sm: 20,
	md: 24,
	lg: 26,
	xl: 28,
	['2xl']: 40,
	['3xl']: 40,
	['4xl']: 44,
	['5xl']: 48,
	['6xl']: 50,
	['7xl']: 60,
	['8xl']: 72,
} as const

export const typography = {
	fontFamily: {
		common: 'Poppins, sans-serif',
		fancy: 'Mikael Outline, sans-serif',
	},
	fontWeight: {
		regular: '400',
		semibold: '600',
		bold: '700',
	},
	fontSize: {
		mobile: {
			display: {
				sm: fontSizes['3xl'] + 'px',
				md: fontSizes['4xl'] + 'px',
				lg: fontSizes['5xl'] + 'px',
			},
			heading: {
				sm: fontSizes['lg'] + 'px',
				md: fontSizes['xl'] + 'px',
				lg: fontSizes['2xl'] + 'px',
			},
			text: {
				sm: fontSizes['xs'] + 'px',
				md: fontSizes['sm'] + 'px',
				lg: fontSizes['md'] + 'px',
			},
		},

		larger: {
			display: {
				sm: fontSizes['4xl'] + 'px',
				md: fontSizes['5xl'] + 'px',
				lg: fontSizes['6xl'] + 'px',
			},
			heading: {
				sm: fontSizes['lg'] + 'px',
				md: fontSizes['xl'] + 'px',
				lg: fontSizes['2xl'] + 'px',
			},
			text: {
				sm: fontSizes['xs'] + 'px',
				md: fontSizes['sm'] + 'px',
				lg: fontSizes['md'] + 'px',
			},
		},
	},
	lineHeight: {
		mobile: {
			display: {
				sm: lineHeights['3xl'] + 'px',
				md: lineHeights['4xl'] + 'px',
				lg: lineHeights['6xl'] + 'px',
			},
			heading: {
				sm: lineHeights['lg'] + 'px',
				md: lineHeights['xl'] + 'px',
				lg: lineHeights['2xl'] + 'px',
			},
			text: {
				sm: lineHeights['xs'] + 'px',
				md: lineHeights['sm'] + 'px',
				lg: lineHeights['md'] + 'px',
			},
		},

		larger: {
			display: {
				sm: lineHeights['5xl'] + 'px',
				md: lineHeights['7xl'] + 'px',
				lg: lineHeights['8xl'] + 'px',
			},
			heading: {
				sm: lineHeights['xl'] + 'px',
				md: lineHeights['2xl'] + 'px',
				lg: lineHeights['3xl'] + 'px',
			},
			text: {
				sm: lineHeights['xs'] + 'px',
				md: lineHeights['sm'] + 'px',
				lg: lineHeights['md'] + 'px',
			},
		},
	},
} as const
