// client/src/pages/Settings/Support.tsx
import { useState } from 'react'
import styles from './settings.module.scss'

const FAQ = [
	{
		q: 'Jak dodać nowe ogłoszenie?',
		a: 'Przejdź do sekcji Ogłoszenia i kliknij przycisk "Nowe ogłoszenie". Wypełnij tytuł i treść, a następnie opublikuj.',
	},
	{
		q: 'Jak zmienić swoje osiedle?',
		a: 'Zmiana osiedla wymaga kontaktu z administracją. Napisz do nas używając formularza poniżej.',
	},
	{
		q: 'Nie mogę się zalogować — co robić?',
		a: 'Sprawdź czy wpisujesz prawidłowy email i hasło. Jeśli problem persystuje, skontaktuj się z nami.',
	},
	{
		q: 'Jak usunąć swoje konto?',
		a: 'Usunięcie konta jest możliwe przez kontakt z administracją. Napisz do nas — usuniemy Twoje dane w ciągu 7 dni.',
	},
]

export default function SettingsSupport() {
	const [openFaq, setOpenFaq] = useState<number | null>(null)
	const [subject, setSubject] = useState('')
	const [message, setMessage] = useState('')
	const [sent, setSent] = useState(false)

	const handleSend = () => {
		if (!subject.trim() || !message.trim()) return
		// W przyszłości: fetch POST /api/support
		setSent(true)
	}

	return (
		<div className={styles.section}>
			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Często zadawane pytania</h2>
				<div className={styles.faqList}>
					{FAQ.map((item, i) => (
						<div key={i} className={styles.faqItem}>
							<button
								className={styles.faqQuestion}
								onClick={() => setOpenFaq(openFaq === i ? null : i)}
							>
								{item.q}
								<svg
									viewBox="0 0 24 24"
									fill="none"
									className={openFaq === i ? styles.rotated : ''}
								>
									<path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							{openFaq === i && (
								<p className={styles.faqAnswer}>{item.a}</p>
							)}
						</div>
					))}
				</div>
			</div>

			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Napisz do nas</h2>
				{sent ? (
					<div className={styles.sentMsg}>
						<span>✅</span>
						<p>Wiadomość wysłana! Odpiszemy wkrótce.</p>
					</div>
				) : (
					<>
						<div className={styles.formField}>
							<label className={styles.label}>Temat</label>
							<input
								className={styles.input}
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								placeholder="Opisz krótko problem..."
							/>
						</div>
						<div className={styles.formField}>
							<label className={styles.label}>Wiadomość</label>
							<textarea
								className={styles.textarea}
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								rows={4}
								placeholder="Opisz szczegółowo..."
							/>
						</div>
						<button
							className={styles.saveBtn}
							onClick={handleSend}
							disabled={!subject.trim() || !message.trim()}
						>
							Wyślij wiadomość
						</button>
					</>
				)}
			</div>

			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Kontakt</h2>
				<div className={styles.contactList}>
					<a href="mailto:kontakt@tutej.app" className={styles.contactItem}>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="1.8" strokeLinecap="round" />
							<path d="M22 6l-10 7L2 6" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
						kontakt@tutej.app
					</a>
				</div>
			</div>
		</div>
	)
}