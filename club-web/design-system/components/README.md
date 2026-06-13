# Design System Components

Components for aster based on design system

### Components

- Accordion
- Avatar
- Alert
- Backdrop
- Badge
- Button
- Breadcrumbs
- Card
- Carousel
- Checkbox
- Date picker
- Divider
- Drawer
- Dropdown
- File upload
- Footer
- Header
- Link
- List
- Modal
- Navigation
- Pagination
- Progress bar
- Progress indicator
- Radio button
- Select
- Table
- Tabs
- Input
- Toggle
- Tooltip

### Guide to Customizing Components

Our primary UI library in Aster is heroui. The first priority when customizing components should be to utilize heroui directly. If heroui does not meet our requirements, or if extensive customization is necessary, here are some tips to implement custom components our way.

### Solution 1 (Extend styles)

This solution is using for extend some styling from design system into `heroui` component one by one

The `heroui` have utility function named `extendVariants` to make us extend our styling into heroui one by one

Here is the example

```tsx
// design-system/components/button/Button.tsx
'use client'

import { Button as HeroUIButton } from '@heroui/button'
import { extendVariants } from '@heroui/react'

// design-system/components/button/Button.tsx

export const Button = extendVariants(HeroUIButton, {
	variants: {
		size: {
			lg: 'rounded-full',
			md: 'rounded-full',
			sm: 'rounded-full',
		},
	},
	defaultVariants: {
		size: 'md',
	},
})
```

### Solution 2 (Custom hook)

This solution is using when we have to custom many styles and some additional functionality, so the based component from `heroui` does not meet us requirement.

Thanks to heroui for providing us with headless UI hooks that contain the behavior and functionality of their components. For example:

- Button - heroui supports a headless UI with a custom hook called useButton to handle button behavior.
  Steps to implement custom components:

#### Step to implement custom component

1. Use headless hooks to control our components, like Button.
2. Implement styling with Tailwind variants that can handle state changes for different styles.
3. Use all of tokens from our design system that locate at `/app/design-system/constants` this is all tokens for our website

Here is the example

```tsx
// design-system/components/button/Button.tsx
'use client'

import { type ButtonProps as HeroUIButtonProps, useButton } from '@heroui/button'
import { Ripple } from '@heroui/ripple'
import { Spinner } from '@heroui/spinner'
import { type ReactNode, forwardRef } from 'react'

// design-system/components/button/Button.tsx

interface ButtonProps extends HeroUIButtonProps {
	children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const {
		domRef,
		children,
		spinnerSize,
		spinner = <Spinner color="current" size={spinnerSize} />,
		spinnerPlacement,
		startContent,
		endContent,
		isLoading,
		disableRipple,
		getButtonProps,
		getRippleProps,
	} = useButton({
		ref,
		...props,
	})

	const { ripples, onClear } = getRippleProps()

	return (
		<button ref={domRef} {...getButtonProps()}>
			{startContent}
			{isLoading && spinnerPlacement === 'start' && spinner}
			{children}
			{isLoading && spinnerPlacement === 'end' && spinner}
			{endContent}
			{!disableRipple && <Ripple ripples={ripples} onClear={onClear} />}
		</button>
	)
})
```
