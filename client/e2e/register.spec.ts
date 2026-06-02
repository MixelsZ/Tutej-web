import { test, expect } from '@playwright/test'

const MOCK_NEIGHBORHOODS = [
    { id: 10, name: 'Wilda' },
    { id: 20, name: 'Jeżyce' }
]

test.describe('Formularz Rejestracji - Walidacja i Integracja z API', () => {

    test.beforeEach(async ({ page }) => {
        await page.route('**/api/neighborhoods', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify(MOCK_NEIGHBORHOODS)
            })
        })

        await page.goto('http://localhost:5173/register')
    })

    // Pomocnik — enkapsuluje interakcję z react-select.
    // toPass ponawia cały blok jeśli dropdown zamknie się przed kliknięciem opcji.
    async function selectNeighborhood(page: any, name: string) {
        await expect(async () => {
            await page.getByRole('combobox').click()
            await expect(
                page.locator('[class*="react-select__option"]', { hasText: name })
            ).toBeVisible({ timeout: 2000 })
        }).toPass({ timeout: 10000 })

        await page.locator('[class*="react-select__option"]', { hasText: name }).click()

        // Weryfikujemy że wartość faktycznie została ustawiona w select
        await expect(
            page.locator('[class*="react-select__single-value"]')
        ).toHaveText(name)
    }

    test('powinien zablokować wysyłkę gdy nazwisko ma mniej niż 3 litery i nie wywołać API', async ({ page }) => {
        let apiCalled = false
        await page.route('**/api/auth/register', async (route) => {
            apiCalled = true
            await route.abort()
        })

        // Imię OK (Jan = 3 litery), ale nazwisko za krótkie (Co = 2 litery)
        // Testujemy wyłącznie walidację długości części nazwiska
        await page.getByPlaceholder('Imię i nazwisko').fill('Jan Co')
        await page.getByPlaceholder('Adres e-mail').fill('jan@example.com')
        await page.getByPlaceholder('Hasło').fill('Bezpieczne123')
        await selectNeighborhood(page, 'Wilda')

        await page.getByRole('button', { name: 'Zarejestruj się' }).click()

        // data-testid jest odporny na hashowanie CSS Modules
        await expect(page.getByTestId('error-msg'))
            .toHaveText('Zarówno imię, jak i nazwisko muszą mieć co najmniej 3 litery.')
        expect(apiCalled).toBe(false)
    })

    test('powinien zablokować wysyłkę gdy hasło nie ma wielkiej litery i cyfry', async ({ page }) => {
        let apiCalled = false
        await page.route('**/api/auth/register', async (route) => {
            apiCalled = true
            await route.abort()
        })

        // Poprawne imię/nazwisko — izolujemy test do walidacji hasła
        await page.getByPlaceholder('Imię i nazwisko').fill('Jan Kowalski')
        await page.getByPlaceholder('Adres e-mail').fill('jan@example.com')
        // 8+ znaków ale brak cyfry i wielkiej litery
        await page.getByPlaceholder('Hasło').fill('slabehaslo')
        await selectNeighborhood(page, 'Wilda')

        await page.getByRole('button', { name: 'Zarejestruj się' }).click()

        await expect(page.getByTestId('error-msg'))
            .toHaveText('Hasło musi zawierać przynajmniej jedną wielką literę i jedną cyfrę.')
        expect(apiCalled).toBe(false)
    })

    test('powinien rozbić pełne imię na firstName/lastName i przekierować do /login po udanej rejestracji', async ({ page }) => {
        let interceptedPayload: any = null

        await page.route('**/api/auth/register', async (route) => {
            interceptedPayload = route.request().postDataJSON()
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ success: true })
            })
        })

        await page.getByPlaceholder('Imię i nazwisko').fill('Jan Kowalski')
        await page.getByPlaceholder('Adres e-mail').fill('jan.kowalski@example.com')
        await page.getByPlaceholder('Hasło').fill('Bezpieczne123')
        await selectNeighborhood(page, 'Wilda')

        await page.getByRole('button', { name: 'Zarejestruj się' }).click()

        // Weryfikujemy że komponent poprawnie rozbił fullName.trim().split(' ')
        expect(interceptedPayload).not.toBeNull()
        expect(interceptedPayload.firstName).toBe('Jan')
        expect(interceptedPayload.lastName).toBe('Kowalski')
        // neighborhoodId musi być liczbą 10 (value z react-select), nie stringiem
        expect(interceptedPayload.neighborhoodId).toBe(10)

        await expect(page).toHaveURL('http://localhost:5173/login')
    })

    test('powinien wyświetlić komunikat błędu z serwera gdy e-mail jest już zajęty (409)', async ({ page }) => {
        await page.route('**/api/auth/register', async (route) => {
            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Podany adres e-mail jest już zarejestrowany.' })
            })
        })

        await page.getByPlaceholder('Imię i nazwisko').fill('Jan Kowalski')
        await page.getByPlaceholder('Adres e-mail').fill('zajety@example.com')
        await page.getByPlaceholder('Hasło').fill('Bezpieczne123')
        await selectNeighborhood(page, 'Wilda')

        await page.getByRole('button', { name: 'Zarejestruj się' }).click()

        // Błąd pochodzi z serwera (data.message) — komponent przepisuje go do stanu error
        await expect(page.getByTestId('error-msg'))
            .toHaveText('Podany adres e-mail jest już zarejestrowany.')
        // Użytkownik pozostaje na stronie rejestracji
        await expect(page).toHaveURL('http://localhost:5173/register')
    })

    test('powinien wyświetlić błąd połączenia gdy serwer jest niedostępny', async ({ page }) => {
        await page.route('**/api/auth/register', async (route) => {
            await route.abort('failed')
        })

        await page.getByPlaceholder('Imię i nazwisko').fill('Jan Kowalski')
        await page.getByPlaceholder('Adres e-mail').fill('jan@example.com')
        await page.getByPlaceholder('Hasło').fill('Bezpieczne123')
        await selectNeighborhood(page, 'Wilda')

        await page.getByRole('button', { name: 'Zarejestruj się' }).click()

        // Blok catch w komponencie: setError('Nie można połączyć się z serwerem.')
        await expect(page.getByTestId('error-msg'))
            .toHaveText('Nie można połączyć się z serwerem.')
    })
})