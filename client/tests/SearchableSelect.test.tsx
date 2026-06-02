import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchableSelect from '../src/components/SearchableSelect'

describe('SearchableSelect Component - Testy integracji danych (Bez tautologii)', () => {

    beforeEach(() => {
        vi.restoreAllMocks()
    })

    describe('Asynchroniczne pobieranie i mapowanie danych', () => {
        it('powinien pobrać dane z API i zmapować surową strukturę [id, name] na [value, label]', async () => {
            // Mockujemy odpowiedź sieciową z surowymi danymi z bazy danych
            const mockNeighborhoods = [
                { id: 10, name: 'Osiedle Piastowskie' },
                { id: 20, name: 'Osiedle Rzeczypospolitej' }
            ]

            const fetchMock = vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockNeighborhoods)
            })
            vi.stubGlobal('fetch', fetchMock)

            render(<SearchableSelect onChange={vi.fn()} />)

            // Sprawdzamy, czy strzał poszedł pod właściwy endpoint
            expect(fetchMock).toHaveBeenCalledWith('http://localhost:5000/api/neighborhoods')

            // Klikamy w select za pomocą aria-label/placeholder, aby wywołać wyświetlenie opcji
            const selectWrapper = screen.getByText('Osiedle')
            await userEvent.click(selectWrapper)

            // Test nietautologiczny: Sprawdzamy, czy nazwa z bazy ('name') stała się widoczną etykietą ('label')
            await waitFor(() => {
                expect(screen.getByText('Osiedle Piastowskie')).toBeTruthy()
                expect(screen.getByText('Osiedle Rzeczypospolitej')).toBeTruthy()
            })
        })

        it('powinien wyłączyć wskaźnik ładowania, jeśli zapytanie do API zakończy się błędem sieci', async () => {
            // Symulujemy awarię sieci/serwera
            const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'))
            vi.stubGlobal('fetch', fetchMock)

            const { container } = render(<SearchableSelect onChange={vi.fn()} />)

            // Zamiast badać stany wewnętrzne Reacta, sprawdzamy zachowanie interfejsu:
            // Szukamy elementu wskazującego na ładowanie w strukturze react-select
            await waitFor(() => {
                const loadingIndicator = container.querySelector('.react-select__loading-indicator')
                // Logika w .catch(() => setIsLoading(false)) musi spowodować zniknięcie spinnera
                expect(loadingIndicator).toBeNull()
            })
        })
    })

    describe('Interakcja i translacja zdarzeń', () => {
        it('powinien wyekstrahować samo ID liczbowe i przekazać je do funkcji wyższego rzędu', async () => {
            const onChangeMock = vi.fn()
            const mockNeighborhoods = [{ id: 44, name: 'Wilda' }]

            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockNeighborhoods)
            }))

            render(<SearchableSelect onChange={onChangeMock} />)

            // Otwieramy i wybieramy opcję
            const selectWrapper = screen.getByText('Osiedle')
            await userEvent.click(selectWrapper)
            
            const option = await screen.findByText('Wilda')
            await userEvent.click(option)

            // Test nietautologiczny: Biblioteka react-select pod maską zwraca obiekt { value: 44, label: 'Wilda' }.
            // Nasz test udowadnia, że adapter zadziałał i wyizolował komponent, zwracając czystą liczbę 44.
            expect(onChangeMock).toHaveBeenCalledTimes(1)
            expect(onChangeMock).toHaveBeenCalledWith(44)
        })
    })
})