import React from 'react'

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> & {
	size?: number | string
	variant?: 'light' | 'dark'
}

const strokeFor = (variant: IconProps['variant']) => (variant === 'dark' ? '#fff' : 'currentColor')

export const Home = ({ size = 24, variant = 'light', className, ...props }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={strokeFor(variant)}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
		{...props}
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M19 8.71l-5.333 -4.148a2.666 2.666 0 0 0 -3.274 0l-5.334 4.148a2.665 2.665 0 0 0 -1.029 2.105v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-7.2c0 -.823 -.38 -1.6 -1.03 -2.105" />
		<path d="M16 15c-2.21 1.333 -5.792 1.333 -8 0" />
	</svg>
)

export const HomeLight = (props: Omit<IconProps, 'variant'>) => <Home variant="light" {...props} />
export const HomeDark = (props: Omit<IconProps, 'variant'>) => <Home variant="dark" {...props} />

export const Market = ({ size = 24, variant = 'light', className, ...props }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={strokeFor(variant)}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
		{...props}
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M3 21l18 0" />
		<path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" />
		<path d="M5 21l0 -10.15" />
		<path d="M19 21l0 -10.15" />
		<path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" />
	</svg>
)

export const MarketLight = (props: Omit<IconProps, 'variant'>) => <Market variant="light" {...props} />
export const MarketDark = (props: Omit<IconProps, 'variant'>) => <Market variant="dark" {...props} />

export const AddMarket = ({ size = 24, variant = 'light', className, ...props }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={strokeFor(variant)}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
		{...props}
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M12.5 21h-3.926a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304h11.339a2 2 0 0 1 1.977 2.304l-.263 1.708" />
		<path d="M16 19h6" />
		<path d="M19 16v6" />
		<path d="M9 11v-5a3 3 0 0 1 6 0v5" />
	</svg>
)

export const AddMarketLight = (props: Omit<IconProps, 'variant'>) => <AddMarket variant="light" {...props} />
export const AddMarketDark = (props: Omit<IconProps, 'variant'>) => <AddMarket variant="dark" {...props} />

export const LeaderBoard = ({ size = 24, variant = 'light', className, ...props }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={strokeFor(variant)}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
		{...props}
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z" />
	</svg>
)

export const LeaderBoardLight = (props: Omit<IconProps, 'variant'>) => <LeaderBoard variant="light" {...props} />
export const LeaderBoardDark = (props: Omit<IconProps, 'variant'>) => <LeaderBoard variant="dark" {...props} />

const Icons = {
	Home,
	HomeLight,
	HomeDark,
	Market,
	MarketLight,
	MarketDark,
	AddMarket,
	AddMarketLight,
	AddMarketDark,
	LeaderBoard,
	LeaderBoardLight,
	LeaderBoardDark,
}

export default Icons

