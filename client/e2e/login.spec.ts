import { test, expect } from '@playwright/test'

test.describe('Strona Logowania - Przepływy Biznesowe i Integracja API (Bez bazy danych)', () => {

    test.beforeEach(async ({ page }) => {
        // Najpierw przechodzimy na stronę, potem czyścimy localStorage i przeładowujemy,
        // aby React nie zdążył odczytać starej sesji podczas inicjalizacji komponentu
        await page.goto('http://localhost:5173/login')
        await page.evaluate(() => localStorage.clear())
        await page.reload()
    })

    test('powinien zalogować użytkownika, zapisać sesję i przekierować na stronę główną przy poprawnych danych', async ({ page }) => {
        // Konstruujemy fake JWT dokładnie tak, żeby móc porównać go z dokładną wartością
        const fakeJwt = 'header.' + btoa(JSON.stringify({ id: 42, role: 'USER' })) + '.signature'

        await page.route('**/api/auth/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    token: fakeJwt,
                    user: { id: 42, role: 'USER' }
                })
            })
        })

        await page.getByPlaceholder('Adres e-mail').fill('jan.kowalski@tutej.pl')
        await page.getByPlaceholder('Hasło').fill('Zorza2026!')
        await page.getByRole('button', { name: 'Zaloguj się' }).click()

        // Sprawdzamy przekierowanie po sukcesie (window.location.href = '/')
        await expect(page).toHaveURL('http://localhost:5173/')

        const localStorageData = await page.evaluate(() => ({
            token: localStorage.getItem('token'),
            isAuth: localStorage.getItem('isAuth'),
            userId: localStorage.getItem('userId')
        }))

        expect(localStorageData.isAuth).toBe('true')
        expect(localStorageData.userId).toBe('42')
        // Porównujemy dokładną wartość tokenu zamiast toContain('header.'),
        // żeby upewnić się że komponent zapisał token z odpowiedzi, a nie np. pusty string
        expect(localStorageData.token).toBe(fakeJwt)
    })

    test('powinien wyświetlić komunikat o błędzie przesłany z API, gdy podano złe dane', async ({ page }) => {
        await page.route('**/api/auth/login', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Podany adres e-mail nie istnieje w systemie.' })
            })
        })

        await page.getByPlaceholder('Adres e-mail').fill('nieistnieje@tutej.pl')
        await page.getByPlaceholder('Hasło').fill('BledneHaslo123')
        await page.getByRole('button', { name: 'Zaloguj się' }).click()

        // Weryfikujemy że błąd z API pojawił się w UI...
        await expect(page.locator('text=Podany adres e-mail nie istnieje w systemie.')).toBeVisible()
        // ...i że użytkownik NIE został przekierowany (oba warunki muszą być spełnione)
        await expect(page).toHaveURL('http://localhost:5173/login')
    })

    test('powinien obsłużyć awarię infrastruktury sieciowej serwera', async ({ page }) => {
        await page.route('**/api/auth/login', async (route) => {
            // Całkowite zerwanie połączenia — testuje blok catch {} w komponencie
            await route.abort('failed')
        })

        await page.getByPlaceholder('Adres e-mail').fill('serwer.lezy@tutej.pl')
        await page.getByPlaceholder('Hasło').fill('JakiesHaslo123')
        await page.getByRole('button', { name: 'Zaloguj się' }).click()

        await expect(page.locator('text=Nie można połączyć się z serwerem.')).toBeVisible()
    })

    test('powinien wyświetlić błąd walidacji i nie wysłać żądania, gdy pola są puste', async ({ page }) => {
        // Flaga do wykrycia czy fetch w ogóle wyszedł z przeglądarki
        let fetchWasCalled = false

        await page.route('**/api/auth/login', async (route) => {
            fetchWasCalled = true
            await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        })

        // Klikamy przycisk bez wypełniania jakichkolwiek pól
        await page.getByRole('button', { name: 'Zaloguj się' }).click()

        // Walidacja frontendowa: if (!email || !password) { setError(...); return }
        await expect(page.locator('text=Wszystkie pola są wymagane.')).toBeVisible()
        await expect(page).toHaveURL('http://localhost:5173/login')
        // Kluczowe: fetch nie może być wywołany przed przejściem walidacji
        expect(fetchWasCalled).toBe(false)
    })

})