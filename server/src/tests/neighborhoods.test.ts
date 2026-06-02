import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

// 1. PANCERNY MOCK PRISMY DLA NEIGHBORHOODS
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      neighborhood = {
        // Mockujemy findMany, żeby dynamicznie sortował dane alfabetycznie, 
        // dokładnie tak, jak robi to baza danych przez `orderBy: { name: 'asc' }`
        findMany: vi.fn().mockImplementation((args) => {
          const unsortedData = [
            { id: 1, name: 'Wilda' },
            { id: 2, name: 'Jeżyce' },
            { id: 3, name: 'Grunwald' }
          ];

          // Sprawdzamy czy w kodzie produkcyjnym uczeń przekazał poprawne sortowanie asc
          if (args?.orderBy?.name === 'asc') {
            return Promise.resolve(
              [...unsortedData].sort((a, b) => a.name.localeCompare(b.name))
            );
          }

          // Jeśli w kodzie nie byłoby sortowania, zwracamy wymieszane
          return Promise.resolve(unsortedData);
        })
      };
      // Puste mocki dla reszty encji, aby inne routery nie wywalały błędów przy imporcie app
      event = { findMany: vi.fn() };
      user = { findUnique: vi.fn() };
      announcement = { findMany: vi.fn() };
    }
  };
});

// --- SEKCJA TESTÓW ---
describe('Neighborhoods Router - Testy bez bazy (Nietautologiczne)', () => {

  describe('GET /api/neighborhoods', () => {
    it('powinien zwrócić status 200 oraz listę osiedli ułożoną ALFABETYCZNIE', async () => {
      // Działanie
      const response = await request(app).get('/api/neighborhoods');

      // Asercje nietautologiczne:
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);

      // Kluczowy test logiki biznesowej: sprawdzamy czy "Grunwald" jest pierwszy, mimo że w bazie był trzeci
      expect(response.body[0].name).toBe('Grunwald');
      expect(response.body[1].name).toBe('Jeżyce');
      expect(response.body[2].name).toBe('Wilda');
    });
  });
});