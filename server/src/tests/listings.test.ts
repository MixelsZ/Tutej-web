import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

// 1. DYNAMICZNY MOCK PRISMY (Bez bazy danych)
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      listing = {
        // Mock dla GET / - dane zwracane chronologicznie (symulacja orderBy createdAt desc)
        findMany: vi.fn().mockResolvedValue([
          { id: 2, title: 'Nowsze ogłoszenie', createdAt: new Date('2026-06-02') },
          { id: 1, title: 'Starsze ogłoszenie', createdAt: new Date('2026-06-01') }
        ]),
        
        // Mock dla POST / - sprawdza, czy dane zostały prawidłowo sparsowane na liczby
        create: vi.fn().mockImplementation((args) => {
          return Promise.resolve({
            id: 123,
            title: args.data.title,
            price: args.data.price, // Sprawdzimy czy to Float
            authorId: args.data.authorId, // Sprawdzimy czy to Int
            neighborhoodId: args.data.neighborhoodId // Sprawdzimy czy przepisało z usera
          });
        }),

        // Mock dla PATCH /:id/status
        update: vi.fn().mockImplementation((args) => {
          return Promise.resolve({
            id: args.where.id,
            status: args.data.status
          });
        })
      };

      user = {
        // Symulujemy, że autor o ID 5 mieszka na osiedlu o ID 99
        findUnique: vi.fn().mockImplementation((args) => {
          if (args.where.id === 5) {
            return Promise.resolve({ id: 5, neighborhoodId: 99 });
          }
          return Promise.resolve(null);
        })
      };

      // Puste mocki dla świętego spokoju innych routerów
      event = { findMany: vi.fn() };
      neighborhood = { findMany: vi.fn() };
      announcement = { findMany: vi.fn() };
    }
  };
});

// --- SEKCJA TESTÓW NIETAUTOLOGICZNYCH ---
describe('Listings Router - Testy Logiki i Walidacji (Bez tautologii)', () => {

  describe('POST /api/listings', () => {
    it('powinien poprawnie sparsować Stringi na typy liczbowe oraz automatycznie przypisać osiedle autora', async () => {
      const payload = {
        title: 'Rower miejski',
        description: 'W dobrym stanie',
        price: '150.50', // Wysyłamy jako String – sprawdzamy rzutowanie na Float
        contact: '123456789',
        authorId: '5',   // Wysyłamy jako String – sprawdzamy rzutowanie na Int
        images: ['data:image/png;base64,xyz']
      };

      const response = await request(app).post('/api/listings').send(payload);

      expect(response.status).toBe(201);
      
      // ASERCJE NIETAUTOLOGICZNE:
      // 1. Sprawdzamy, czy aplikacja poprawnie użyła parseFloat()
      expect(response.body.price).toBe(150.50);
      expect(typeof response.body.price).toBe('number');

      // 2. Sprawdzamy, czy aplikacja poprawnie użyła parseInt()
      expect(response.body.authorId).toBe(5);

      // 3. Najważniejsze: czy bez wiedzy klienta skrypt pobrał z bazy osiedle autora (99) i przypisał do ogłoszenia
      expect(response.body.neighborhoodId).toBe(99);
    });

    it('powinien zwrócić błąd 404, jeśli wskazany authorId nie istnieje w systemie', async () => {
      const payload = {
        title: 'Szafa',
        description: 'Oddam za darmo',
        contact: '999',
        authorId: '9999', // Tego usera nasz mock nie znajdzie (zwróci null)
        images: ['img.jpg']
      };

      const response = await request(app).post('/api/listings').send(payload);

      // Testuje warunek brzegowy: if (!user)
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Użytkownik nie znaleziony');
    });

    it('powinien wypluć 400, gdy tablica zdjęć jest pusta', async () => {
      const payload = {
        title: 'Szafa',
        description: 'Opis',
        contact: '999',
        authorId: '5',
        images: [] // Pusta tablica – walidacja powinna to odrzucić
      };

      const response = await request(app).post('/api/listings').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Brak wymaganych pól lub zdjęć');
    });
  });

  describe('PATCH /api/listings/:id/status', () => {
    it('powinien pomyślnie zaktualizować status, gdy podano wartość z bezpiecznej listy (Enum)', async () => {
      const response = await request(app)
        .patch('/api/listings/42/status')
        .send({ status: 'RESERVED' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('RESERVED');
    });

    it('powinien bezwzględnie odrzucić żądanie (400), gdy status jest spoza dozwolonego słownika', async () => {
      const response = await request(app)
        .patch('/api/listings/42/status')
        .send({ status: 'KUPIONE_PRZEZ_SASIADA' }); // Wartość niedozwolona

      // Sprawdzamy poprawność instrukcji: !['AVAILABLE', 'RESERVED', 'SOLD'].includes(status)
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid data');
    });
  });
});