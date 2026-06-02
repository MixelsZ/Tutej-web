import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventCard from '../src/components/EventCard'

// Mockowanie podkomponentu Button, aby odizolować test EventCard
vi.mock('../src/components/Button', () => ({
    default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}))

const mockEvent = {
    id: 1,
    name: 'Koncert na Wildzie',
    description: 'Świetny koncert plenerowy.',
    place: 'Poznań, Rynek Wildecki',
    date: '2026-06-15T19:00:00.000Z',
    duration: '2h',
    price: 0, // Test darmowego wydarzenia
    image: 'wilda.jpg',
    authorId: 100,
    author: { firstName: 'Jan', lastName: 'Kowalski' },
    attendees: [{ id: 2, firstName: 'Anna' }]
}

describe('EventCard Component - Testy logiki i efektów (Bez tautologii)', () => {

    beforeEach(() => {
        localStorage.clear()
        document.body.style.overflow = 'auto'
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Zarządzanie stanem globalnego DOM (Scroll Lock)', () => {
        it('powinien zablokować przewijanie body po otwarciu modala i odblokować po jego zamknięciu', async () => {
            render(<EventCard event={mockEvent} onDelete={vi.fn()} />)

            // Na starcie body powinno być domyślne
            expect(document.body.style.overflow).toBe('auto')

            // Klikamy w kartę, aby ustawić isOpen = true
            const card = screen.getByRole('heading', { name: 'Koncert na Wildzie' })
            await userEvent.click(card)

            // Test nietautologiczny: Weryfikujemy, czy efekt uboczny (useEffect) zmodyfikował globalne drzewo dokumentu
            expect(document.body.style.overflow).toBe('hidden')

            // Klikamy przycisk wstecz (zamknięcie modala)
            const backButton = screen.getByRole('button', { name: '' }) // Pierwszy SVG button
            await userEvent.click(backButton)

            // Sprawdzamy czy sprzątanie po efekcie działa poprawnie
            expect(document.body.style.overflow).toBe('auto')
        })
    })

    describe('Bezpieczeństwo i autoryzacja (Widoczność akcji)', () => {
        it('powinien ukryć przycisk usuwania, jeśli aktualny użytkownik nie jest autorem wydarzenia', () => {
            // Symulujemy, że zalogowany jest ktoś inny (ID: 999) niż autor (ID: 100)
            localStorage.setItem('userId', '999')

            const { container } = render(<EventCard event={mockEvent} onDelete={vi.fn()} />)

            // Przycisk kosza pobierany z SVG nie powinien istnieć w strukturze dokumentu
            const deleteButton = container.querySelector('button')
            expect(deleteButton).toBeNull()
        })

        it('powinien wyświetlić przycisk usuwania i pozwolić na usunięcie, jeśli zalogowany użytkownik to autor', async () => {
            // Identyfikatory się zgadzają
            localStorage.setItem('userId', '100')
            const onDeleteMock = vi.fn()

            const { container } = render(<EventCard event={mockEvent} onDelete={onDeleteMock} />)

            const deleteButton = container.querySelector('button')
            expect(deleteButton).toBeTruthy()

            // Klikamy przycisk usuwania
            await userEvent.click(deleteButton!)

            // Weryfikujemy czy poprawnie przesłano ID usuwanej karty
            expect(onDeleteMock).toHaveBeenCalledTimes(1)
            expect(onDeleteMock).toHaveBeenCalledWith(1)
        })
    })

    describe('Prezentacja i transformacja danych biznesowych', () => {
        it('powinien wyświetlić tekst "Darmowe", gdy cena wynosi 0', async () => {
            render(<EventCard event={mockEvent} onDelete={vi.fn()} />)

            // Otwieramy modal, aby zobaczyć sekcję szczegółów kosztów
            const card = screen.getByRole('heading', { name: 'Koncert na Wildzie' })
            await userEvent.click(card)

            // Sprawdzamy, czy potrójny warunek logiczny zwrócił ciąg tekstowy zamiast liczby
            expect(screen.getByText('Darmowe')).toBeTruthy()
        })

        it('powinien sformatować i dokleić walutę PLN, gdy cena jest większa od zera', async () => {
            const paidEvent = { ...mockEvent, price: 49 }
            render(<EventCard event={paidEvent} onDelete={vi.fn()} />)

            const card = screen.getByRole('heading', { name: 'Koncert na Wildzie' })
            await userEvent.click(card)

            expect(screen.getByText('49 PLN')).toBeTruthy()
            expect(screen.queryByText('Darmowe')).toBeNull()
        })
    })
})