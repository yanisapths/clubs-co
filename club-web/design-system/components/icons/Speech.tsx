import Image from 'next/image'
import React, { ReactNode } from 'react'

export const Speech = ({ children }: { children: ReactNode }) => {
	return (
		<div className="relative inset-0 z-[80] flex h-[124px] w-[355px] flex-col items-center justify-center rounded-full bg-grey-200 px-3xl text-start lg:h-[104px] lg:w-[420px] lg:px-5xl">
			<div className="absolute right-6 top-[6.5rem] lg:right-5 lg:top-[5.5rem]">
				<Image
					src={`${process.env.NEXT_PUBLIC_ASSET}/main/images/weekly-quiz/speech.png`}
					alt="speech"
					width={50}
					height={50}
				/>
			</div>
			<div className="items-center justify-center">{children}</div>
		</div>
	)
}
