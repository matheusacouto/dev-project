import { version as uuidVersion } from 'uuid'
import orchestrator from 'tests/orchestrator.js'
import user from 'models/user'
import password from 'models/password'

beforeAll(async () => {
    await orchestrator.waitForAllServices()
    await orchestrator.clearDatabase()
    await orchestrator.runPendingMigrations()
})

describe('POST /api/v1/users', () => {
    describe('Anonymous user', () => {
        test('With unique and valid data', async () => {
            const response = await fetch('http://localhost:3000/api/v1/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'matheus',
                    email: 'matheus@example.com',
                    password: '123456',
                }),
            })

            expect(response.status).toBe(201)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                id: responseBody.id,
                username: 'matheus',
                email: 'matheus@example.com',
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            })

            expect(uuidVersion(responseBody.id)).toBe(4)
            expect(Date.parse(responseBody.created_at)).not.toBeNaN()
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

            const userInDatabase = await user.findOneByUsername('matheus')
            const correctPassswordMatch = await password.compare(
                '123456',
                userInDatabase.password
            )
            const incorrectPassswordMatch = await password.compare(
                '123',
                userInDatabase.password
            )
            expect(correctPassswordMatch).toBe(true)
            expect(incorrectPassswordMatch).toBe(false)
        })

        test('With duplicated "email"', async () => {
            const response1 = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'emailduplicado',
                        email: 'duplicado@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(response1.status).toBe(201)

            const response2 = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'emailduplicado2',
                        email: 'Duplicado@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(response2.status).toBe(400)

            const response2Body = await response2.json()

            expect(response2Body).toEqual({
                name: 'ValidationError',
                message: 'Email already exists',
                action: 'Use a different email',
                status_code: 400,
            })
        })

        test('With duplicated "username"', async () => {
            const response1 = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'usernameduplicado_',
                        email: 'usernameduplicado@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(response1.status).toBe(201)

            const response2 = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'UsernameDuplicado_',
                        email: 'usernameduplicado2@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(response2.status).toBe(400)

            const response2Body = await response2.json()

            expect(response2Body).toEqual({
                name: 'ValidationError',
                message: 'Username already exists',
                action: 'Use a different username',
                status_code: 400,
            })
        })
    })
})
