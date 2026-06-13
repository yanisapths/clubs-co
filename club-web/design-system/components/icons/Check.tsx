import { IconSvgProps } from './types'

export const Check = ({ ...props }: IconSvgProps) => {
	return (
		<svg
			width={props.size ? props.size : '24'}
			height={props.size ? props.size : '24'}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M20 6L9 17L4 12"
				stroke={props.color ? props.color : 'currentColor'}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
