const mongoose = require('mongoose')

const istanceModal = new mongoose.Schema({
    key: {
        type: String,
    },
    numero: {
        type: String,
    },
    id_usuario: {
        type: String,
    },
})

module.exports = mongoose.model('Instances', istanceModal)
