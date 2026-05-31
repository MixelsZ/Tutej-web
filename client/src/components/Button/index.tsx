import styles from './button.module.scss'
import React from 'react'

interface ButtonProps {
	text?: string
	variant?: 'primary' | 'secondary' | 'delete'
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean
	children?: React.ReactNode
}

export default function Button({
	text,
	variant = 'primary',
	onClick,
	disabled = false,
	children,
}: ButtonProps) {
	return (
		<div className={styles.container}>
			<button
				className={`${styles.button} ${styles[variant]}`}
				onClick={onClick}
				disabled={disabled}
			>
				{children || text}
			</button>
		</div>
	)
}
