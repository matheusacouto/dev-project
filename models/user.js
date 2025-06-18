import database from 'infra/database'
import { NotFoundError, ValidationError } from 'infra/errors'

async function create(userInputValues) {
    const newUser = await runInsertQuery(userInputValues)
    return newUser

    async function runInsertQuery(userInputValues) {
        await validadeUniqueEmail(userInputValues.email)
        await validadeUniqueUsername(userInputValues.username)

        async function validadeUniqueUsername(username) {
            const results = await database.query({
                text: `
            SELECT 
              username 
            FROM 
              users 
            WHERE 
              LOWER(username) = LOWER($1)
            ;`,
                values: [username],
            })
            if (results.rowCount > 0) {
                throw new ValidationError({
                    message: 'Username already exists',
                    action: 'Use a different username',
                })
            }
        }

        async function validadeUniqueEmail(email) {
            const results = await database.query({
                text: `
            SELECT 
              email 
            FROM 
              users 
            WHERE 
              LOWER(email) = LOWER($1)
            ;`,
                values: [email],
            })
            if (results.rowCount > 0) {
                throw new ValidationError({
                    message: 'Email already exists',
                    action: 'Use a different email',
                })
            }
        }

        const results = await database.query({
            text: `
              INSERT INTO 
                users (username, email, password)
              VALUES 
                ($1, $2, $3)
              RETURNING 
                *
              ;`,
            values: [
                userInputValues.username,
                userInputValues.email,
                userInputValues.password,
            ],
        })
        return results.rows[0]
    }
}

async function findOneByUsername(username) {
    const userFound = await runSelectQuery(username)

    return userFound

    async function runSelectQuery(username) {
        const results = await database.query({
            text: `
      SELECT 
        * 
      FROM 
        users 
      WHERE 
        LOWER(username) = LOWER($1)
      LIMIT 
        1
      ;`,
            values: [username],
        })
        if (results.rowCount === 0) {
            throw new NotFoundError({
                message: 'User not found',
                action: 'Check the username and try again',
            })
        }
        return results.rows[0]
    }
}

const user = {
    create,
    findOneByUsername,
}

export default user
