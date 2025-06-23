import { version as uuidVersion } from 'uuid'
import orchestrator from 'tests/orchestrator.js'

beforeAll(async () => {
    await orchestrator.waitForAllServices()
    await orchestrator.clearDatabase()
    await orchestrator.runPendingMigrations()
})

describe('GET /api/v1/users/[username]', () => {
    describe('Anonymous user', () => {
        test('With exact case match', async () => {
            const response1 = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'MesmoCase',
                        email: 'mesmo.case@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(response1.status).toBe(201)

            const response2 = await fetch(
                'http://localhost:3000/api/v1/users/MesmoCase'
            )

            expect(response2.status).toBe(200)

            const responseBody2 = await response2.json()

            expect(responseBody2).toEqual({
                id: responseBody2.id,
                username: 'MesmoCase',
                email: 'mesmo.case@example.com',
                password: responseBody2.password,
                created_at: responseBody2.created_at,
                updated_at: responseBody2.updated_at,
            })

            expect(uuidVersion(responseBody2.id)).toBe(4)
            expect(Date.parse(responseBody2.created_at)).not.toBeNaN()
            expect(Date.parse(responseBody2.updated_at)).not.toBeNaN()
        })

        test('With case mismatch', async () => {
            const response1 = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'CaseDiff',
                        email: 'case.diff@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(response1.status).toBe(201)

            const response2 = await fetch(
                'http://localhost:3000/api/v1/users/casediff'
            )

            expect(response2.status).toBe(200)

            const responseBody2 = await response2.json()

            expect(responseBody2).toEqual({
                id: responseBody2.id,
                username: 'CaseDiff',
                email: 'case.diff@example.com',
                password: responseBody2.password,
                created_at: responseBody2.created_at,
                updated_at: responseBody2.updated_at,
            })

            expect(uuidVersion(responseBody2.id)).toBe(4)
            expect(Date.parse(responseBody2.created_at)).not.toBeNaN()
            expect(Date.parse(responseBody2.updated_at)).not.toBeNaN()
        })

        test('With non-existent username', async () => {
            const response = await fetch(
                'http://localhost:3000/api/v1/users/UserNotFound'
            )

            expect(response.status).toBe(404)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                name: 'NotFoundError',
                message: 'User not found',
                action: 'Check the username and try again',
                status_code: 404,
            })
        })
    })
})
