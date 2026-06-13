import React from 'react'

import { IconSvgProps } from './types'

export const CheckCircleSolid = ({ ...props }: IconSvgProps) => {
	return (
		<svg
			width={props.size || 16}
			height={props.size || 16}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clip-path="url(#clip0_10285_391083)">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M0.667969 7.9974C0.667969 3.94731 3.95121 0.664063 8.0013 0.664063C12.0514 0.664063 15.3346 3.94731 15.3346 7.9974C15.3346 12.0475 12.0514 15.3307 8.0013 15.3307C3.95121 15.3307 0.667969 12.0475 0.667969 7.9974ZM11.4328 5.58911C11.6326 5.78891 11.6326 6.11286 11.4328 6.31266L7.33982 10.4057C7.14002 10.6055 6.81607 10.6055 6.61627 10.4057L4.56976 8.35917C4.36996 8.15937 4.36996 7.83542 4.56976 7.63562C4.76956 7.43582 5.09351 7.43582 5.29331 7.63562L6.97805 9.32036L10.7093 5.58911C10.9091 5.38931 11.233 5.38931 11.4328 5.58911Z"
					fill={props.color ? props.color : 'currentColor'}
				/>
			</g>
			<defs>
				<clipPath id="clip0_10285_391083">
					<rect width="16" height="16" fill="white" />
				</clipPath>
			</defs>
		</svg>
	)
}
