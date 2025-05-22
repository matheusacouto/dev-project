import useSWR from 'swr'

async function fetchAPI(key) {
    const response = await fetch(key)
    const responseBody = await response.json()
    return responseBody
}

export default function StatusPage() {
    return (
        <>
            <h1>Status</h1>
            <UpdatedAt />
            <h1>Database</h1>
            <DatabaseStatus />
        </>
    )
}

function UpdatedAt() {
    const { isLoading, data } = useSWR('/api/v1/status', fetchAPI, {
        refreshInterval: 2000,
    })

    let updatedAtText = 'Carregando...'
    if (!isLoading && data) {
        updatedAtText = new Date(data.updated_at).toLocaleString('pt-BR')
    }
    return <div>Última atualização: {updatedAtText}</div>
}

function DatabaseStatus() {
    const { isLoading, data } = useSWR('/api/v1/status', fetchAPI)

    let versionText = 'Carregando...'
    let maxConnectionsText = 'Carregando...'
    let opened_connectionsText = 'Carregando...'

    if (!isLoading && data) {
        const { version, max_connections, opened_connections } =
            data.dependencies.database
        if (version) versionText = version
        if (max_connections) maxConnectionsText = max_connections
        if (opened_connections) opened_connectionsText = opened_connections
    }

    return (
        <>
            <div>Versão: {versionText}</div>
            <div>Conexões máximas: {maxConnectionsText}</div>
            <div>Conexões abertas: {opened_connectionsText}</div>
        </>
    )
}
