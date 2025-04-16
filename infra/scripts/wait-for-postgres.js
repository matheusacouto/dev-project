/* eslint-disable no-undef */
function checkPostgres() {
    const { exec } = require('child_process')
    exec('docker exec postgres-dev pg_isready --host localhost', handleReturn)

    function handleReturn(err, stdout) {
        if (stdout.search('accepting connections') === -1) {
            process.stdout.write('.')
            checkPostgres()
            return
        }
        console.log('\nPostgreSQL is ready!')
    }
}

process.stdout.write('\n\nWaiting for PostgreSQL to be ready')
checkPostgres()
