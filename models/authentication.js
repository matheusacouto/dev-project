import { NotFoundError, UnauthorizedError } from 'infra/errors'
import password from 'models/password'
import user from 'models/user'

async function getAuthenticatedUser(providedEmail, providedPassword) {
    try {
        const storedUser = await findUserByEmail(providedEmail)
        await validatePassword(providedPassword, storedUser.password)

        return storedUser
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw new UnauthorizedError({
                message: 'Authentication data does not match',
                action: 'Check if the data sent is correct',
            })
        }

        throw error
    }

    async function findUserByEmail(providedEmail) {
        let storedUser

        try {
            storedUser = await user.findOneByEmail(providedEmail)
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw new UnauthorizedError({
                    message: 'Email does not match',
                    action: 'Check if it is correct',
                })
            }

            throw error
        }

        return storedUser
    }

    async function validatePassword(providedPassword, storedPassword) {
        const correctPassswordMatch = await password.compare(
            providedPassword,
            storedPassword
        )

        if (!correctPassswordMatch) {
            throw new UnauthorizedError({
                message: 'Password does not match',
                action: 'Check if it is correct',
            })
        }
    }
}

const authentication = {
    getAuthenticatedUser,
}

export default authentication
