export const parsePayload = (request) => {
    const raw = request.body?.payload

    if (!raw) {
        return {}
    }

    if (typeof raw === 'object') {
        return raw
    }

    try {
        return JSON.parse(raw)
    } catch {
        return {}
    }
}

export const sendJsonError = (response, error, status = 500) => {
    console.error(error)
    response.status(status).json({
        errorMsg: error instanceof Error ? error.message : String(error),
    })
}
