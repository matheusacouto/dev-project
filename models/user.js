import database from 'infra/database'
import password from 'models/password.js'
import { NotFoundError, ValidationError } from 'infra/errors'

async function create(userInputValues) {
    await validateUniqueUsername(userInputValues.username)
    await validateUniqueEmail(userInputValues.email)
    await hashPassowordInObject(userInputValues)

    const newUser = await runInsertQuery(userInputValues)
    return newUser

    async function runInsertQuery(userInputValues) {
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

async function update(username, userInputValues) {
    const currentUser = await findOneByUsername(username)

    if ('username' in userInputValues) {
        if (username.toLowerCase() !== userInputValues.username.toLowerCase())
            await validateUniqueUsername(userInputValues.username)
    }

    if ('email' in userInputValues) {
        await validateUniqueEmail(userInputValues.email)
    }

    if ('password' in userInputValues) {
        await hashPassowordInObject(userInputValues)
    }

    const userWithNewValues = { ...currentUser, ...userInputValues }

    const updatedUser = await runUpdateQuery(userWithNewValues)
    return updatedUser

    async function runUpdateQuery(userWithNewValues) {
        const results = await database.query({
            text: `
            UPDATE
              users
            SET
              username =  $2,
              email = $3,
              password = $4,
              updated_at = timezone('utc', now())
            WHERE
              id = $1
            RETURNING 
              *
          `,
            values: [
                userWithNewValues.id,
                userWithNewValues.username,
                userWithNewValues.email,
                userWithNewValues.password,
            ],
        })
        return results.rows[0]
    }
}

async function validateUniqueUsername(username) {
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

async function validateUniqueEmail(email) {
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

async function hashPassowordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password)
    userInputValues.password = hashedPassword
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
    update,
}

export default user
