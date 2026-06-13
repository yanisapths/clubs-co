import { IconSvgProps } from './types'

interface ArrowRightProps extends IconSvgProps {
	linearColor1?: string
	linearColor2?: string
}
export const ArrowRight = ({ linearColor1, linearColor2, ...props }: ArrowRightProps) => {
	return (
		<svg
			width={props.size || 24}
			height={props.size || 24}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M10.7646 5.89864C10.9723 5.62297 11.3642 5.5679 11.6398 5.77563L18.2283 10.7404C18.5039 10.9481 18.559 11.34 18.3513 11.6156L13.3865 18.204C13.1788 18.4797 12.7869 18.5348 12.5113 18.3271C12.2356 18.1193 12.1805 17.7274 12.3883 17.4518L16.4449 12.0684L6.38598 13.4821C6.04416 13.5301 5.72812 13.292 5.68008 12.9502C5.63204 12.6083 5.87019 12.2923 6.21201 12.2443L16.2709 10.8306L10.8876 6.77393C10.6119 6.56619 10.5568 6.17432 10.7646 5.89864Z"
				fill="url(#paint0_linear_6622_119374)"
			/>
			<defs>
				<linearGradient
					id="paint0_linear_6622_119374"
					x1="6.5789"
					y1="19.3457"
					x2="17.5722"
					y2="4.75703"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor={linearColor1 ? linearColor1 : props.color ? props.color : 'currentColor'} />
					<stop offset="1" stopColor={linearColor2 ? linearColor2 : props.color ? props.color : 'currentColor'} />
				</linearGradient>
			</defs>
		</svg>
	)
}
