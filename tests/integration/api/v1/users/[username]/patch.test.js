import orchestrator from 'tests/orchestrator.js'
import { version as uuidVersion } from 'uuid'
import user from 'models/user'
import password from 'models/password'

beforeAll(async () => {
    await orchestrator.waitForAllServices()
    await orchestrator.clearDatabase()
    await orchestrator.runPendingMigrations()
})

describe('PATCH /api/v1/users/[username]', () => {
    describe('Anonymous user', () => {
        test('With non-existent "username"', async () => {
            const response = await fetch(
                'http://localhost:3000/api/v1/users/UserNotFound',
                {
                    method: 'PATCH',
                }
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

        test('With duplicated "username"', async () => {
            await orchestrator.createUser({
                username: 'user1',
            })

            await orchestrator.createUser({
                username: 'user2',
            })

            const response = await fetch(
                'http://localhost:3000/api/v1/users/user2',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'user1',
                    }),
                }
            )

            expect(response.status).toBe(400)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                name: 'ValidationError',
                message: 'Username already exists',
                action: 'Use a different username',
                status_code: 400,
            })
        })

        test('With unique "username"', async () => {
            const createdUser = await orchestrator.createUser({
                username: 'uniqueUser',
            })

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser.username}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'uniqueUser2',
                    }),
                }
            )

            expect(response.status).toBe(200)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                id: responseBody.id,
                username: 'uniqueUser2',
                email: responseBody.email,
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            })

            expect(uuidVersion(responseBody.id)).toBe(4)
            expect(Date.parse(responseBody.created_at)).not.toBeNaN()
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

            expect(responseBody.updated_at > responseBody.created_at).toBe(true)
        })

        test('With unique "email"', async () => {
            const createdUser = await orchestrator.createUser({
                email: 'uniqueEmail@example.com',
            })

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser.username}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: 'uniqueEmail2@example.com',
                    }),
                }
            )

            expect(response.status).toBe(200)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                id: responseBody.id,
                username: responseBody.username,
                email: 'uniqueEmail2@example.com',
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            })

            expect(uuidVersion(responseBody.id)).toBe(4)
            expect(Date.parse(responseBody.created_at)).not.toBeNaN()
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

            expect(responseBody.updated_at > responseBody.created_at).toBe(true)
        })

        test('With duplicated "email"', async () => {
            await orchestrator.createUser({
                email: 'email1@example.com',
            })

            const createdUser2 = await orchestrator.createUser({
                email: 'email2@example.com',
            })

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser2.username}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: 'email1@example.com',
                    }),
                }
            )

            expect(response.status).toBe(400)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                name: 'ValidationError',
                message: 'Email already exists',
                action: 'Use a different email',
                status_code: 400,
            })
        })

        test('With new "password"', async () => {
            const createdUser = await orchestrator.createUser({
                password: 'newPassword1',
            })

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser.username}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        password: 'newPassword2',
                    }),
                }
            )

            expect(response.status).toBe(200)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                id: responseBody.id,
                username: responseBody.username,
                email: responseBody.email,
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            })

            expect(uuidVersion(responseBody.id)).toBe(4)
            expect(Date.parse(responseBody.created_at)).not.toBeNaN()
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

            expect(responseBody.updated_at > responseBody.created_at).toBe(true)

            const userInDatabase = await user.findOneByUsername(
                createdUser.username
            )
            const correctPassswordMatch = await password.compare(
                'newPassword2',
                userInDatabase.password
            )
            const incorrectPassswordMatch = await password.compare(
                'newPassword1',
                userInDatabase.password
            )
            expect(correctPassswordMatch).toBe(true)
            expect(incorrectPassswordMatch).toBe(false)
        })
    })
})
