import { describe, it, expect, beforeEach } from 'vitest'
import { getToken, getAuthHeaders, getCurrentUser, logout } from '../src/hooks/useAuth'

describe('useAuth Helpers - Testy odporności i logiki autoryzacji (Bez tautologii)', () => {
    
    beforeEach(() => {
        localStorage.clear()
    })

    describe('getCurrentUser - Parsowanie i odporność JWT', () => {
        it('powinien poprawnie sparsować poprawny token JWT i wyciągnąć dane użytkownika', () => {
            const mockPayload = {
                id: 1,
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: 'jan@tutej.pl',
                photo: null,
                role: 'USER',
                neighborhoodId: 5
            }

            // Tworzymy imitację struktury JWT: header.payload.signature
            // Kodujemy tylko payload do Base64, ignorując nagłówek i sygnaturę
            const base64Payload = btoa(JSON.stringify(mockPayload))
            const fakeJwt = `dummyHeader.${base64Payload}.dummySignature`
            
            localStorage.setItem('token', fakeJwt)

            const user = getCurrentUser()
            
            expect(user).not.toBeNull()
            expect(user?.email).toBe('jan@tutej.pl')
            expect(user?.role).toBe('USER')
        })

        it('powinien bezpiecznie zwrócić null i nie wyrzucić aplikacji (crash), gdy token ma niepoprawny format Base64', () => {
            // Token z nieprawidłowym znakiem w Base64 (np. spacje lub znaki specjalne), co wywoła błąd w atob()
            const corruptedJwt = 'header.To Nie Jest Poprawne Base64!!!.signature'
            localStorage.setItem('token', corruptedJwt)

            // Test nietautologiczny: sprawdzamy odporność na wyjątek (try/catch w kodzie źródłowym)
            expect(() => {
                const user = getCurrentUser()
                expect(user).toBeNull()
            }).not.toThrow()
        })

        it('powinien zwrócić null, gdy struktura tokenu nie zawiera części z payloadem (brak kropek)', () => {
            // Token całkowicie uszkodzony, brak drugiej sekcji po kropce
            localStorage.setItem('token', 'invalid-token-without-dots')

            const user = getCurrentUser()
            expect(user).toBeNull()
        })
    })

    describe('getAuthHeaders - Generowanie nagłówków sieciowych', () => {
        it('powinien wygenerować nagłówek Bearer tylko wtedy, gdy token istnieje w localStorage', () => {
            localStorage.setItem('token', 'xyz123')

            const headers = getAuthHeaders()

            // Sprawdzamy czy struktura zawiera wymagany klucz i czy format jest poprawny
            expect(headers).toHaveProperty('Authorization')
            expect(headers['Authorization']).toBe('Bearer xyz123')
            expect(headers['Content-Type']).toBe('application/json')
        })

        it('nie powinien dołączać klucza Authorization, jeśli użytkownik jest niezalogowany', () => {
            // Upewniamy się, że pamięć jest pusta
            const headers = getAuthHeaders()

            // Test nietautologiczny: Brak tokenu musi skutkować brakiem klucza w obiekcie, 
            // aby Axios/Fetch nie wysłał nagłówka "Authorization: Bearer null"
            expect(headers).not.toHaveProperty('Authorization')
            expect(headers['Content-Type']).toBe('application/json')
        })
    })

    describe('logout - Czyszczenie skutków ubocznych sesji', () => {
        it('powinien kompletnie usunąć zarówno token, jak i flagi pomocnicze stanu logowania', () => {
            localStorage.setItem('token', 'secret-token')
            localStorage.setItem('isAuth', 'true')

            logout()

            // Sprawdzamy czy wyczyszczono pełen zestaw danych autoryzacyjnych
            expect(localStorage.getItem('token')).toBeNull()
            expect(localStorage.getItem('isAuth')).toBeNull()
            expect(getToken()).toBeNull()
        })
    })
})