import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

vi.mock('@prisma/client', () => {
    return {
        PrismaClient: class {
            event = {
                // Mock który weryfikuje czy router przekazał orderBy: { date: 'asc' }
                findMany: vi.fn().mockImplementation((args) => {
                    const data = [
                        { id: 1, name: 'Starsze wydarzenie', date: new Date('2026-06-01'), authorId: 1 },
                        { id: 2, name: 'Nowsze wydarzenie',  date: new Date('2026-07-01'), authorId: 1 }
                    ]
                    // Sortujemy tylko jeśli router poprawnie przekazał orderBy asc
                    if (args?.orderBy?.date === 'asc') {
                        return Promise.resolve([...data].sort(
                            (a, b) => a.date.getTime() - b.date.getTime()
                        ))
                    }
                    // Bez sortowania zwracamy odwrotnie — test to wykryje
                    return Promise.resolve([...data].reverse())
                }),

                create: vi.fn().mockImplementation((args) => {
                    return Promise.resolve({
                        id: 99,
                        title:           args.data.name,
                        price:           args.data.price,        // sprawdzimy typ
                        authorId:        args.data.authorId,     // sprawdzimy typ
                        neighborhoodId:  args.data.neighborhoodId // sprawdzimy skąd pochodzi
                    })
                })
            };

            user = {
                findUnique: vi.fn().mockImplementation((args) => {
                    if (args.where.id === 1) {
                        return Promise.resolve({ id: 1, neighborhoodId: 77 })
                    }
                    return Promise.resolve(null)
                })
            };

            neighborhood = { findMany: vi.fn().mockResolvedValue([]) };
        }
    }
})

describe('Events Router - Testy logiki biznesowej', () => {

    describe('GET /api/events', () => {
        it('powinien zwrócić wydarzenia posortowane chronologicznie (najwcześniejsze pierwsze)', async () => {
            const response = await request(app).get('/api/events')

            expect(response.status).toBe(200)
            expect(response.body).toHaveLength(2)
            // Test nietautologiczny: mock celowo zwraca dane w złej kolejności bez orderBy
            // Jeśli router nie przekaże orderBy: { date: 'asc' }, ten test padnie
            expect(new Date(response.body[0].date).getTime())
                .toBeLessThan(new Date(response.body[1].date).getTime())
        })
    })

    describe('POST /api/events', () => {
        it('powinien rzutować stringi na typy liczbowe i przypisać osiedle autora', async () => {
            const payload = {
                name:        'Koncert',
                description: 'Opis',
                place:       'Park',
                date:        '2026-08-20T18:00:00.000Z',
                authorId:    '1',      // string → parseInt
                price:       '29.99',  // string → parseFloat
                image:       'img.jpg'
            }

            const response = await request(app).post('/api/events').send(payload)

            expect(response.status).toBe(201)

            // Weryfikujemy rzutowanie typów
            expect(typeof response.body.authorId).toBe('number')
            expect(response.body.authorId).toBe(1)
            expect(typeof response.body.price).toBe('number')
            expect(response.body.price).toBe(29.99)

            // Kluczowe: neighborhoodId pochodzi z bazy (user.neighborhoodId = 77), nie z body
            expect(response.body.neighborhoodId).toBe(77)
        })

        it('powinien zwrócić 400, gdy brakuje wymaganego pola (np. image)', async () => {
            const response = await request(app).post('/api/events').send({
                name: 'Brak reszty pól'
                // brak: description, place, date, authorId, image
            })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Brak wymaganych pól')
        })

        it('powinien zwrócić 404, gdy authorId wskazuje na nieistniejącego użytkownika', async () => {
            const response = await request(app).post('/api/events').send({
                name:        'Wydarzenie widmo',
                description: 'Opis',
                place:       'Miejsce',
                date:        '2026-08-20T18:00:00.000Z',
                authorId:    '9999', // mock zwróci null dla tego ID
                image:       'img.jpg'
            })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('Użytkownik nie znaleziony')
        })

        it('powinien obsłużyć brak pola price jako null (pole opcjonalne)', async () => {
            const response = await request(app).post('/api/events').send({
                name:        'Darmowe wydarzenie',
                description: 'Opis',
                place:       'Park',
                date:        '2026-08-20T18:00:00.000Z',
                authorId:    '1',
                image:       'img.jpg'
                // brak price
            })

            expect(response.status).toBe(201)
            // Router robi: price ? parseFloat(price) : null
            expect(response.body.price).toBeNull()
        })
    })
})