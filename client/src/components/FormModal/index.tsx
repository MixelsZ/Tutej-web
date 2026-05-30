import { type ReactNode, useEffect } from 'react'
import style from './formModal.module.scss'
import Button from '../Button'

interface FormModalProps {
	title: ReactNode
	isOpen: boolean
	onClose: () => void
	onSubmit: () => void
	isSubmitting: boolean
	submitText: string
	children: ReactNode
}

export default function FormModal({
	title,
	isOpen,
	onClose,
	onSubmit,
	isSubmitting,
	submitText,
	children,
}: FormModalProps) {
	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'auto'
		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className={style.overlay} onClick={() => !isSubmitting && onClose()}>
			<div className={style.modal} onClick={(e) => e.stopPropagation()}>
				<div className={style.modalHeader}>
					<button className={style.backBtn} onClick={onClose} disabled={isSubmitting}>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M15 6L9 12L15 18"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<h2>{title}</h2>
				</div>

				<div className={style.modalBody}>{children}</div>

				<div className={style.modalFooter}>
					<Button
						text={isSubmitting ? 'Przetwarzanie...' : submitText}
						variant="primary"
						onClick={onSubmit}
						disabled={isSubmitting}
					/>
				</div>
			</div>
		</div>
	)
}
