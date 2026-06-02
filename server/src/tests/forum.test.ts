import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

let mockUser = { id: 10, neighborhoodId: 5, role: 'USER' };

// 1. BEZPIECZNY MOCK STRUKTURY PRISMY (Bez bazy danych)
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      forum = {
        findMany: vi.fn().mockResolvedValue([
          { id: 1, name: 'Ogólne', neighborhoodId: 5 }
        ])
      };

      post = {
        // Implementacja findMany obsługująca filtrowanie tekstowe (Search) i sortowanie
        findMany: vi.fn().mockImplementation((args) => {
          const allPosts = [
            { id: 101, title: 'Malowanie klatki', content: 'Kiedy będzie malowanie?', forumId: 1 },
            { id: 102, title: 'Zgubiono klucze', content: 'Znaleziono pęk kluczy pod blokiem', forumId: 1 }
          ];

          // Jeśli w routerze zadziała filtr wyszukiwania:
          if (args?.where?.OR) {
            const searchStr = args.where.OR[0].title.contains.toLowerCase();
            return Promise.resolve(allPosts.filter(p => 
              p.title.toLowerCase().includes(searchStr) || p.content.toLowerCase().includes(searchStr)
            ));
          }
          return Promise.resolve(allPosts);
        }),

        // Współdzielony findUnique do sprawdzania uprawnień autora przed usunięciem
        findUnique: vi.fn().mockImplementation((args) => {
          if (args.where.id === 101) {
            return Promise.resolve({ id: 101, title: 'Malowanie klatki', authorId: 10 }); // Właścicielem jest user 10
          }
          if (args.where.id === 102) {
            return Promise.resolve({ id: 102, title: 'Zgubiono klucze', authorId: 99 });  // Właścicielem jest user 99
          }
          return Promise.resolve(null);
        }),
        
        create: vi.fn().mockResolvedValue({ id: 200, title: 'Nowy Post' }),
        delete: vi.fn().mockResolvedValue({ id: 101 })
      };

      comment = {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 })
      };

      // Zabezpieczenie przed crashami w pozostałych plikach
      user = { findUnique: vi.fn() };
      neighborhood = { findMany: vi.fn() };
      announcement = { findMany: vi.fn() };
      listing = { findMany: vi.fn() };
    }
  };
});

// 2. PARCJALNY MOCK MIDDLEWARE AUTH (Zapobiega konfliktom eksportu default)
vi.mock('../routes/auth.js', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    authenticate: (req: any, res: any, next: any) => {
      req.user = mockUser; // Przypisuje obiekt, który możemy dynamicznie zmieniać w testach
      next();
    }
  };
});

// --- SEKCJA TESTÓW NIETAUTOLOGICZNYCH ---
describe('Forums Router - Testy Logiki Biznesowej (Bez tautologii)', () => {

  describe('GET /api/forums/:forumId/posts', () => {
    it('powinien przefiltrować posty i zwrócić tylko te pasujące do frazy ?search=klucze', async () => {
      // Działanie: wysyłamy zapytanie z query stringiem
      const response = await request(app).get('/api/forums/1/posts?search=klucze');

      expect(response.status).toBe(200);
      
      // Asercja nietautologiczna: sprawdzamy, czy warunek filtrowania w routerze 
      // poprawnie przekazał strukturę OR do zapytania Prismy i zwrócił tylko 1 pasujący post
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(102);
      expect(response.body[0].title).toBe('Zgubiono klucze');
    });

    it('powinien zwrócić błąd 400, jeśli zamiast ID forum w URL podano ciąg tekstowy', async () => {
      const response = await request(app).get('/api/forums/nie-liczba/posts');

      // Testuje instrukcję: if (isNaN(forumIdNum))
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nieprawidłowe ID forum');
    });
  });

  describe('DELETE /api/forums/posts/:postId', () => {
    it('powinien pozwolić na usunięcie posta, jeśli zalogowany użytkownik jest jego autorem', async () => {
      // Ustawiamy zalogowanego usera jako autora posta 101 (id: 10)
      mockUser = { id: 10, neighborhoodId: 5, role: 'USER' };

      const response = await request(app)
        .delete('/api/forums/posts/101')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post usunięty');
    });

    it('powinien bezwzględnie zablokować próbę usunięcia cudzego posta (403 Forbidden)', async () => {
      // Zalogowany jest użytkownik 10, ale próbuje usunąć post 102 (którego autorem jest 99)
      mockUser = { id: 10, neighborhoodId: 5, role: 'USER' };

      const response = await request(app)
        .delete('/api/forums/posts/102')
        .set('Authorization', 'Bearer token');

      // Sprawdzamy działanie kluczowej blokady bezpieczeństwa: post.authorId !== user.id
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Brak uprawnień');
    });

    it('powinien zezwolić na usunięcie cudzego posta, jeśli zalogowany użytkownik ma rolę ADMIN', async () => {
      // Użytkownik nie jest właścicielem (id: 10), ale posiada uprawnienia administratora
      mockUser = { id: 10, neighborhoodId: 5, role: 'ADMIN' };

      const response = await request(app)
        .delete('/api/forums/posts/102')
        .set('Authorization', 'Bearer token');

      // Weryfikacja obejścia warunku dla admina: user.role !== 'ADMIN'
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post usunięty');
    });
  });
});