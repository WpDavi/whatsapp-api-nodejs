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
})

module.exports = mongoose.model('SandListModal', sandListModal)
