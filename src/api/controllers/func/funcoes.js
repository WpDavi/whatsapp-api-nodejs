const getIntervel = (limiteInferior, limiteSuperior) => {
    let tempoAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior
    tempoAleatorio *= 1000
    return tempoAleatorio
}

function formatarNumeroTelefone(numero) {
    numero = numero.replace(/\D/g, '')

    if (!numero.startsWith('55')) {
        numero = '55' + numero
    }
    if (numero.length == 13 && numero.charAt(5) === '9') {
        numero = numero.substring(0, 4) + numero.substring(5)
    }

    return numero
}
module.exports = { getIntervel, formatarNumeroTelefone }
