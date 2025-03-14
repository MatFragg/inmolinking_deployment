const esVendedor = (usuarioId, propiedadUserId) => {
    return usuarioId === propiedadUserId
}

const formatDate = fecha => {
    const newDate = new Date(fecha).toISOString().split('T')

    const opt = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return new Date(newDate).toLocaleDateString('es-ES',opt)
}

export {
    esVendedor,
    formatDate
}