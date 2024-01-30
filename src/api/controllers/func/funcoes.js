const getIntervel = (limiteInferior, limiteSuperior) => {
    let tempoAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior
    tempoAleatorio *= 1000
    return tempoAleatorio
}

module.exports = getIntervel
