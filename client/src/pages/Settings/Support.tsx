import TextLink from '../../components/TextLink'
import styles from './settings.module.scss'

export default function SettingsSupport() {
	return (
		<div className={styles.supportCenterContainer}>
			<p className={styles.supportMessage}>
				Masz pytania lub sugestie? Skontaktuj się z nami przez adres{' '}
				<TextLink to="mailto:kontakt@tutej.app" text={'kontakt@tutej.app'} />
			</p>
		</div>
	)
}
