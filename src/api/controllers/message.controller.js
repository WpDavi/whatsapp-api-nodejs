const sandListModal = require('../models/sandListModal')
const { getIntervel, formatarNumeroTelefone } = require('./func/funcoes')

exports.Text = async (req, res) => {
    const {
        ids,
        message,
        message2,
        message3,
        message4,
        daleySegDe,
        daleySegPara,
        ListSand,
    } = req.body
    const results = []
    const erros = []
    async function sendWithDelay(id, message) {
        await WhatsAppInstances[req.query.key].sendTextMessage(id, message)
    }

    for (const id of ids) {
        const formatNumber = formatarNumeroTelefone(id)
        console.log(formatNumber)

        try {
            const interv = await getIntervel(daleySegDe, daleySegPara)
            await new Promise((resolve) => setTimeout(resolve, interv))
            await sendWithDelay(formatNumber, message)
            message2 && (await sendWithDelay(formatNumber, message2))
            message3 && (await sendWithDelay(formatNumber, message3))
            message4 && (await sendWithDelay(formatNumber, message4))

            results.push(formatNumber)
        } catch (error) {
            erros.push(formatNumber)
            //console.log(error)
        }
    }
    const updates = {
        arrey: JSON.stringify({ enviados: results, erros: erros }),
        mesage1: message,
        mesage2: message2,
        mesage3: message3,
        mesage4: message4,
    }
    await sandListModal.findByIdAndUpdate(ListSand, updates, {
        new: true,
    })
    return res.status(201).json({ enviados: results, erros: erros })
}

exports.Image = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        req.body.id,
        req.file,
        'image',
        req.body?.caption
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Video = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        req.body.id,
        req.file,
        'video',
        req.body?.caption
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Audio = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        req.body.id,
        req.file,
        'audio'
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Document = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        req.body.id,
        req.file,
        'document',
        '',
        req.body.filename
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Mediaurl = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendUrlMediaFile(
        req.body.id,
        req.body.url,
        req.body.type, // Types are [image, video, audio, document]
        req.body.mimetype, // mimeType of mediaFile / Check Common mimetypes in `https://mzl.la/3si3and`
        req.body.caption
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Button = async (req, res) => {
    // console.log(res.body)
    const data = await WhatsAppInstances[req.query.key].sendButtonMessage(
        req.body.id,
        req.body.btndata
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Contact = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendContactMessage(
        req.body.id,
        req.body.vcard
    )
    return res.status(201).json({ error: false, data: data })
}

exports.List = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendListMessage(
        req.body.id,
        req.body.msgdata
    )
    return res.status(201).json({ error: false, data: data })
}

exports.MediaButton = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].sendMediaButtonMessage(
        req.body.id,
        req.body.btndata
    )
    return res.status(201).json({ error: false, data: data })
}

exports.SetStatus = async (req, res) => {
    const presenceList = [
        'unavailable',
        'available',
        'composing',
        'recording',
        'paused',
    ]
    if (presenceList.indexOf(req.body.status) === -1) {
        return res.status(400).json({
            error: true,
            message:
                'status parameter must be one of ' + presenceList.join(', '),
        })
    }

    const data = await WhatsAppInstances[req.query.key]?.setStatus(
        req.body.status,
        req.body.id
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Read = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].readMessage(
        req.body.msg
    )
    return res.status(201).json({ error: false, data: data })
}

exports.React = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].reactMessage(
        req.body.id,
        req.body.key,
        req.body.emoji
    )
    return res.status(201).json({ error: false, data: data })
}
