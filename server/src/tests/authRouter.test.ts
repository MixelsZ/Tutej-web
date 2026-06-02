import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import bcrypt from 'bcrypt';

// 1. PANCERNY MOCK PRISMY DLA UŻYTKOWNIKÓW
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      user = {
        findUnique: vi.fn().mockImplementation((args) => {
          // Symulujemy, że w bazie istnieje już użytkownik o konkretnym mailu
          if (args.where.email === 'zajety@test.pl') {
            return Promise.resolve({
              id: 1,
              email: 'zajety@test.pl',
              password: 'hashed_password_123', // hash poprawnego hasła
              role: 'USER',
              neighborhoodId: 5
            });
          }
          // Symulujemy użytkownika o ID 10 na potrzeby zmiany hasła (/me/password)
          if (args.where.id === 10) {
            return Promise.resolve({
              id: 10,
              email: 'jan@test.pl',
              password: 'hashed_stare_haslo',
              role: 'USER',
              neighborhoodId: 5
            });
          }
          return Promise.resolve(null); // Dla innych maili/ID baza jest pusta
        }),
        create: vi.fn().mockResolvedValue({
          id: 2,
          email: 'nowy@test.pl',
          role: 'USER',
          neighborhoodId: 5
        }),
        update: vi.fn().mockResolvedValue({ message: 'Zaktualizowano' })
      };
      event = { findMany: vi.fn() };
      neighborhood = { findMany: vi.fn() };
      announcement = { findMany: vi.fn() };
    }
  };
});

// 2. MOCKOWANIE BIBLIOTEKI 'jose' (Zapewnia poprawne generowanie tokenów w testach)
vi.mock('jose', () => {
  return {
    SignJWT: class {
      setProtectedHeader() { return this; }
      setExpirationTime() { return this; }
      sign() { return Promise.resolve('sztuczny_token_jwt_123'); }
    },
    jwtVerify: vi.fn().mockResolvedValue({
      payload: { id: 10, email: 'jan@test.pl', role: 'USER', neighborhoodId: 5 }
    }),
    TextEncoder: class {
      encode() { return new Uint8Array(); }
    }
  };
});

// --- SEKCJA TESTÓW NIETAUTOLOGICZNYCH ---
describe('Auth Router - Testy Logiki Biznesowej (Bez tautologii)', () => {

  describe('POST /api/auth/register', () => {
    it('powinien zwrócić błąd 409, gdy użytkownik próbuje zarejestrować zajęty adres e-mail', async () => {
      const payload = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'zajety@test.pl', // Adres, który nasz mock bazy danych oznaczył jako zajęty
        password: 'haslo',
        neighborhoodId: 5
      };

      const response = await request(app).post('/api/auth/register').send(payload);

      // Asercja: Sprawdzamy czy instrukcja warunkowa 'if (existing)' działa poprawnie i chroni bazę
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email już istnieje.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('powinien odmówić dostępu (401), gdy hasło nie zgadza się z hashem w bazie danych', async () => {
      // Bezpiecznie szpiegujemy i wymuszamy, aby bcrypt.compare zwrócił fałsz
      const bcryptCompareSpy = vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const payload = {
        email: 'zajety@test.pl',
        password: 'zle_haslo_uzytkownika'
      };

      const response = await request(app).post('/api/auth/login').send(payload);

      // Sprawdzamy, czy aplikacja poprawnie obsłużyła negatywną weryfikację kryptograficzną
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Nieprawidłowy email lub hasło.');
      expect(response.body.token).toBeUndefined(); // Token nie ma prawa się wygenerować!

      bcryptCompareSpy.mockRestore(); // Czyszczenie szpiega
    });
  });

  describe('PUT /api/auth/me/password', () => {
    it('powinien zwrócić błąd 400, jeśli podane "obecne hasło" jest nieprawidłowe', async () => {
      // Wymuszamy porażkę porównania haseł przez bcrypt
      const bcryptCompareSpy = vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const payload = {
        currentPassword: 'bledne_stare_haslo',
        newPassword: 'nowe_super_haslo_123'
      };

      const response = await request(app)
        .put('/api/auth/me/password')
        .set('Authorization', 'Bearer poprawny_token')
        .send(payload);

      // Weryfikacja logiki bezpieczeństwa: Nie wolno zmienić hasła, nie znając starego
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Nieprawidłowe obecne hasło.');

      bcryptCompareSpy.mockRestore();
    });
  });
});