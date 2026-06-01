import { test, expect } from '@playwright/test'

const MOCK_FORUMS = [
    {
        id: 12,
        name: 'Ogródki i Zieleń',
        description: 'Wymiana doświadczeń o osiedlowej roślinności.',
        icon: '🌿',
        _count: { posts: 45 }
    },
    {
        id: 15,
        name: 'Bezpieczeństwo',
        description: 'Zgłoszenia i dyskusje o monitoringu.',
        icon: null,     // Celowo null — testujemy fallback do FORUM_ICONS.default
        _count: null    // Celowo null — testujemy fallback do 0
    }
]

test.describe('Strona Główna Forum - Cykl Życia i Nawigacja (Bez bazy danych)', () => {

    test.beforeEach(async ({ context }) => {
        // Sesja musi trafić do localStorage zanim React się zainicjalizuje
        await context.addInitScript(() => {
            window.localStorage.setItem('userId', '200')
            window.localStorage.setItem('isAuth', 'true')
            window.localStorage.setItem('token', 'fake-jwt-token')
        })
    })

    test('powinien wyświetlić stan ładowania przed wstrzyknięciem danych z API', async ({ page }) => {
        let resolveRoute: (value: unknown) => void
        const routePromise = new Promise(resolve => { resolveRoute = resolve })

        // Blokujemy odpowiedź sieciową — React zostaje w stanie loading
        await page.route('**/api/forums', async (route) => {
            await routePromise
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_FORUMS)
            })
        })

        await page.goto('http://localhost:5173/forum')

        // TEST NIETAUTOLOGICZNY: dopóki sieć wisi, skeleton MUSI być widoczny
        await expect(page.locator('div[class*="loadingState"]')).toBeVisible()

        // Karty forum (h2 z nazwami) nie mają prawa istnieć w DOM podczas ładowania
        // Szukamy konkretnych nazw zamiast ogólnego h2, żeby uniknąć fałszywych wyników
        await expect(page.locator('h2:has-text("Ogródki i Zieleń")')).not.toBeVisible()
        await expect(page.locator('h2:has-text("Bezpieczeństwo")')).not.toBeVisible()

        // Zwalniamy blokadę przed końcem testu — Playwright musi czysto zamknąć żądanie
        resolveRoute!(true)
    })

    test('powinien prawidłowo obsłużyć brakujące dane z API i przekierować do wątku po kliknięciu', async ({ page }) => {
        await page.route('**/api/forums', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_FORUMS)
            })
        })

        await page.goto('http://localhost:5173/forum')

        // Czekamy aż ładowanie się zakończy i skeleton zniknie
        await expect(page.locator('div[class*="loadingState"]')).not.toBeVisible({ timeout: 7000 })

        // TEST NIETAUTOLOGICZNY: mock dał icon: null i _count: null dla "Bezpieczeństwo"
        // Komponent musi użyć fallbacków: forum.icon || FORUM_ICONS.default i forum._count?.posts || 0
        const defaultIconCard = page.locator('button', { hasText: 'Bezpieczeństwo' })

        // Sprawdzamy fallback ikony — '💬' z FORUM_ICONS.default
        await expect(defaultIconCard.locator('text=💬')).toBeVisible()

        // Sprawdzamy fallback licznika — szukamy wewnątrz konkretnej karty, nie na całej stronie,
        // żeby uniknąć kolizji z ewentualnymi zerami w innych miejscach UI
        await expect(defaultIconCard.locator('[class*="postCount"]:has-text("0")')).toBeVisible()

        // INTERAKCJA: kliknięcie karty musi wywołać navigate(`/forum/${forum.id}`)
        await page.locator('h2:has-text("Ogródki i Zieleń")').click()
        await expect(page).toHaveURL('http://localhost:5173/forum/12')
    })

    test('powinien wyświetlić pustą listę i nie crashować, gdy serwer zwróci błąd sieci', async ({ page }) => {
        // Symulujemy całkowite zerwanie połączenia — testuje blok catch(err) w komponencie
        await page.route('**/api/forums', async (route) => {
            await route.abort('failed')
        })

        await page.goto('http://localhost:5173/forum')

        // Komponent w catch() woła setLoading(false), ale setForums([]) — lista pozostaje pusta
        // Sprawdzamy że skeleton znikł (loading=false zadziałało)
        await expect(page.locator('div[class*="loadingState"]')).not.toBeVisible({ timeout: 7000 })

        // Żadna karta forum nie powinna się pojawić
        await expect(page.locator('h2:has-text("Ogródki i Zieleń")')).not.toBeVisible()

        // Strona nie powinna wyrzucić błędu — nagłówek strony musi być widoczny
        await expect(page.locator('text=Forum')).toBeVisible()
    })
})