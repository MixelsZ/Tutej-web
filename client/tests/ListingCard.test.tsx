import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ListingCard from '../src/components/ListingCard'

const mockListing = {
    id: 42,
    title: 'Rower górski Kross',
    description: 'Stan idealny, mało używany.',
    price: 1500,
    contact: '500-600-700',
    status: 'AVAILABLE' as const,
    createdAt: '2026-05-10T10:00:00.000Z',
    authorId: 200,
    author: { firstName: 'Jan', lastName: 'Kowalski' },
    images: [{ id: 1, url: 'kross.jpg' }]
}

describe('ListingCard Component - Testy integracji stanu i sieci (Bez tautologii)', () => {

    beforeEach(() => {
        localStorage.clear()
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Asynchroniczne mutacje stanu i obsługa sieci', () => {
        it('powinien zablokować przyciski podczas wysyłania żądania PATCH i zaktualizować status po sukcesie', async () => {
            localStorage.setItem('userId', '200')

            // 1. Tworzymy kontrolowany punkt obietnicy (Deferred)
            let resolveNetworkCall!: (value: Response) => void
            const networkPromise = new Promise<Response>((resolve) => {
                resolveNetworkCall = resolve
            })

            // 2. Mockujemy fetch, aby zwracał naszą wiszącą obietnicę
            const fetchMock = vi.mocked(fetch).mockImplementation(() => networkPromise)

            const onUpdateMock = vi.fn()
            render(<ListingCard listing={mockListing} onUpdate={onUpdateMock} />)

            const reserveBtn = screen.getByRole('button', { name: 'ZAREZERWOWANE' })

            // 3. Odpalamy kliknięcie wewnątrz act, aby React przetworzył synchroniczną zmianę stanu na true
            act(() => {
                fireEvent.click(reserveBtn)
            })

            // 4. SEKWENCJA W TOKU: W tym momencie sieć "wisi", więc przycisk MUSI być zablokowany
            expect(reserveBtn).toBeDisabled()

            // 5. SEKWENCJA FINISZ: Ręcznie pozwalamy sieci odpowiedzieć i pakujemy to w await act
            await act(async () => {
                resolveNetworkCall({
                    ok: true,
                    json: () => Promise.resolve({ ...mockListing, status: 'RESERVED' as const }),
                } as Response)
            })

            // 6. Po powrocie z sieci przycisk się odblokowuje, a stan się aktualizuje
            expect(reserveBtn).not.toBeDisabled()
            expect(onUpdateMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'RESERVED' }))
        })
    })

    describe('Reaktywność i synchronizacja źródeł danych', () => {
        it('powinien zaktualizować wewnętrzny stan, gdy zewnętrzny rekord ulegnie zmianie', () => {
            localStorage.setItem('userId', '999') // Zwykły przeglądający
            
            const { rerender } = render(<ListingCard listing={mockListing} />)
            
            expect(screen.getByText('Dostępne')).toBeTruthy()

            // Symulujemy sytuację, w której zewnętrzna lista odświeża dane (np. przez WebSocket)
            const externallyUpdatedListing = { ...mockListing, status: 'SOLD' as const }
            rerender(<ListingCard listing={externallyUpdatedListing} />)

            // Sprawdzamy, czy useEffect poprawnie przepiął stan i zaktualizował badge na "Sprzedane"
            expect(screen.getByText('Sprzedane')).toBeTruthy()
            expect(screen.queryByText('Dostępne')).toBeNull()
        })
    })

    describe('Logika transformacji danych brudnych (Typowanie any)', () => {
        it('powinien poprawnie sformatować cenę, gdy zostanie przekazana jako tekst/string liczbowy', () => {
            const dirtyDataListing = {
                ...mockListing,
                price: '2499.50'
            }

            render(<ListingCard listing={dirtyDataListing} />)

            // \s* oznacza zero lub więcej spacji - zabezpiecza nas przed kaprysami implementacji toLocaleString w JSDOM
            expect(screen.getByText(/2\s*499,5\s*PLN/)).toBeTruthy()
        })

        it('powinien wyświetlić "Darmowe", jeśli wartość ceny to logiczne zero w postaci tesktowej', () => {
            const freeListing = { ...mockListing, price: '0.00' }
            render(<ListingCard listing={freeListing} />)

            expect(screen.getByText('Darmowe')).toBeTruthy()
        })
    })
})