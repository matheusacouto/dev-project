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
            const user1Response = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'user1',
                        email: 'user1@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(user1Response.status).toBe(201)

            const user2Response = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'user2',
                        email: 'user2@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(user2Response.status).toBe(201)

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
            const user1Response = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'uniqueUser',
                        email: 'uniqueUser@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(user1Response.status).toBe(201)

            const response = await fetch(
                'http://localhost:3000/api/v1/users/uniqueUser',
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
                email: 'uniqueUser@example.com',
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
            const user1Response = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'uniqueEmail',
                        email: 'uniqueEmail@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(user1Response.status).toBe(201)

            const response = await fetch(
                'http://localhost:3000/api/v1/users/uniqueEmail',
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
                username: 'uniqueEmail',
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
            const email1Response = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'email1',
                        email: 'email1@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(email1Response.status).toBe(201)

            const email2Response = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'email2',
                        email: 'email2@example.com',
                        password: '123456',
                    }),
                }
            )

            expect(email2Response.status).toBe(201)

            const response = await fetch(
                'http://localhost:3000/api/v1/users/email2',
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
            const user1Response = await fetch(
                'http://localhost:3000/api/v1/users',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'newPassword',
                        email: 'newPassword@example.com',
                        password: 'newPassword',
                    }),
                }
            )

            expect(user1Response.status).toBe(201)

            const response = await fetch(
                'http://localhost:3000/api/v1/users/newPassword',
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
                username: 'newPassword',
                email: 'newPassword@example.com',
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            })

            expect(uuidVersion(responseBody.id)).toBe(4)
            expect(Date.parse(responseBody.created_at)).not.toBeNaN()
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

            expect(responseBody.updated_at > responseBody.created_at).toBe(true)

            const userInDatabase = await user.findOneByUsername('newPassword')
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

        // test('With case match "username"', async () => {
        //     const userResponse = await fetch(
        //         'http://localhost:3000/api/v1/users',
        //         {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify({
        //                 username: 'usercase',
        //                 email: 'usercase@example.com',
        //                 password: '123456',
        //             }),
        //         }
        //     )

        //     expect(userResponse.status).toBe(201)

        //     const response = await fetch(
        //         'http://localhost:3000/api/v1/users/usercase',
        //         {
        //             method: 'PATCH',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify({
        //                 username: 'UserCase',
        //             }),
        //         }
        //     )

        //     expect(response.status).toBe(200)
        // })

        // test('With empty "username"', async () => {
        //     const userResponse = await fetch(
        //         'http://localhost:3000/api/v1/users',
        //         {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify({
        //                 username: 'filleduser',
        //                 email: 'filleduser@example.com',
        //                 password: '123456',
        //             }),
        //         }
        //     )

        //     expect(userResponse.status).toBe(201)

        //     const response = await fetch(
        //         'http://localhost:3000/api/v1/users/usercase',
        //         {
        //             method: 'PATCH',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify({
        //                 username: '',
        //             }),
        //         }
        //     )

        //     expect(response.status).toBe(200)
        // })
    })
})
