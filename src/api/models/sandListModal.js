const mongoose = require('mongoose')

const sandListModal = new mongoose.Schema({
    key: {
        type: String,
    },
    arrey: {
        type: String,
    },
    id_usuario: {
        type: String,
    },
    mesage1: {
        type: String,
    },
    mesage2: {
        type: String,
    },
    mesage3: {
        type: String,
    },
    mesage4: {
        type: String,
    },
})

module.exports = mongoose.model('SandListModal', sandListModal)
