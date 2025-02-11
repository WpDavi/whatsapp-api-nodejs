const { WhatsAppInstance } = require('../class/instance')
const fs = require('fs')
const path = require('path')
const config = require('../../config/config')
const { Session } = require('../class/session')
const istanceModal = require('../models/istanceModal')
const userSchema = require('../models/user')
const sandListModal = require('../models/sandListModal')

exports.initPure = async (req, res) => {
    const key = req.query.key
    const webhook = !req.query.webhook ? false : req.query.webhook
    const webhookUrl = !req.query.webhookUrl ? null : req.query.webhookUrl
    const appUrl = config.appUrl || req.protocol + '://' + req.headers.host
    const instance = new WhatsAppInstance(key, webhook, webhookUrl)
    const data = await instance.init()
    WhatsAppInstances[data.key] = instance
    res.json({
        error: false,
        message: 'Initializing successfully',
        key: data.key,
        webhook: {
            enabled: webhook,
            webhookUrl: webhookUrl,
        },
        qrcode: {
            url: appUrl + '/instance/qr?key=' + data.key,
        },
        browser: config.browser,
    })
}

exports.init = async (req, res) => {
    try {
        const instanceUser = await istanceModal.findOne({
            key: req.query.key,
        })

        if (instanceUser) {
            res.json({ message: 'nome ja utilizado' })
        } else {
            await istanceModal.create({
                key: req.query.key,
                numero: req.query.fone,
                id_usuario: req.query.iduser,
            })

            const key = req.query.key
            const webhook = !req.query.webhook ? false : req.query.webhook
            const webhookUrl = !req.query.webhookUrl
                ? null
                : req.query.webhookUrl
            const appUrl =
                config.appUrl || req.protocol + '://' + req.headers.host
            const instance = new WhatsAppInstance(key, webhook, webhookUrl)
            const data = await instance.init()
            WhatsAppInstances[data.key] = instance
            res.json({
                error: false,
                message: 'Initializing successfully',
                key: data.key,
                webhook: {
                    enabled: webhook,
                    webhookUrl: webhookUrl,
                },
                qrcode: {
                    url: appUrl + '/instance/qr?key=' + data.key,
                },
                browser: config.browser,
            })
        }
    } catch (error) {
        res.json({ error })
    }
}

exports.qr = async (req, res) => {
    try {
        const qrcode = await WhatsAppInstances[req.query.key]?.instance.qr
        res.render('qrcode', {
            qrcode: qrcode,
        })
    } catch {
        res.json({
            qrcode: '',
        })
    }
}

exports.qrbase64 = async (req, res) => {
    try {
        const qrcode = await WhatsAppInstances[req.query.key]?.instance.qr
        res.json({
            error: false,
            message: 'QR Base64 fetched successfully',
            qrcode: qrcode,
        })
    } catch {
        res.json({
            qrcode: '',
        })
    }
}

exports.info = async (req, res) => {
    const instance = WhatsAppInstances[req.query.key]
    let data
    try {
        data = await instance.getInstanceDetail(req.query.key)
    } catch (error) {
        data = {}
    }
    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        instance_data: data,
    })
}

exports.restore = async (req, res, next) => {
    try {
        const session = new Session()
        let restoredSessions = await session.restoreSessions()
        return res.json({
            error: false,
            message: 'All instances restored',
            data: restoredSessions,
        })
    } catch (error) {
        next(error)
    }
}

exports.logout = async (req, res) => {
    let errormsg
    try {
        await WhatsAppInstances[req.query.key].instance?.sock?.logout()
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'logout successfull',
        errormsg: errormsg ? errormsg : null,
    })
}

exports.delete = async (req, res) => {
    let errormsg
    try {
        await WhatsAppInstances[req.query.key].deleteInstance(req.query.key)
        delete WhatsAppInstances[req.query.key]
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'Instance deleted successfully',
        data: errormsg ? errormsg : null,
    })
}

exports.list = async (req, res) => {
    if (req.query.active) {
        let instance = []
        const db = mongoClient.db('whatsapp-api')
        const result = await db.listCollections().toArray()
        result.forEach((collection) => {
            instance.push(collection.name)
        })

        return res.json({
            error: false,
            message: 'All active instance',
            data: instance,
        })
    }

    let instance = Object.keys(WhatsAppInstances).map(async (key) =>
        WhatsAppInstances[key].getInstanceDetail(key)
    )
    let data = await Promise.all(instance)

    return res.json({
        error: false,
        message: 'All instance listed',
        data: data,
    })
}

exports.CreateUser = async (req, res) => {
    const { email, password, name, phone } = req.body
    try {
        const existingUser = await userSchema.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message:
                    'E-mail já está em uso. Por favor, escolha outro e-mail.',
            })
        }

        const newUser = await userSchema.create({
            email,
            password,
            name,
            phone,
        })

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: newUser,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao criar usuário',
            error: error.message,
        })
    }
}

exports.UserLogin = async (req, res) => {
    const { email, password } = req.body
    const data = new Date()
    try {
        const user = await userSchema.findOne({ email })

        if (!user) {
            return res
                .status(401)
                .json({ message: 'E-mail ou senha inválidos.' })
        }
        if (user.password !== password) {
            return res
                .status(401)
                .json({ message: 'E-mail ou senha inválidos.' })
        }
        const token = `${user._id}${JSON.stringify(data)}`
        await userSchema.updateOne({ email }, { $set: { token } })

        res.status(200).json({ message: 'Login bem-sucedido!', user, token })
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao realizar login',
            error: error.message,
        })
    }
}

exports.GetUser = async (req, res) => {
    try {
        const user = await userSchema.findOne({ token: req.headers.token })
        if (!user) {
            return res.status(401).json({ message: 'Token não encontrado' })
        }
        res.status(200).json({ message: 'Token encontrado!', user })
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao encontrar o token',
            error: error.message,
        })
    }
}

exports.GetInstanceUser = async (req, res) => {
    try {
        const instances = await istanceModal.find({
            instances: req.headers.id,
        })
        if (!instances) {
            return res.status(401).json({ message: 'instances não encontrado' })
        }
        res.status(200).json(instances)
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao encontrar o instances',
            error: error.message,
        })
    }
}

exports.SandListModal = async (req, res) => {
    try {
        const List = await sandListModal.create({
            id_usuario: req.headers.token,
        })
        res.status(201).json(List)
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao criar lista',
            error: error.message,
        })
    }
}

exports.getSandList = async (req, res) => {
    try {
        const sandList = await sandListModal
            .findOne({
                id_usuario: req.headers.token,
            })
            .sort({ _id: -1 })
            .limit(1)
        if (!sandList) {
            return res.status(401).json({ message: 'instances não encontrado' })
        }
        res.status(200).json(sandList)
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao encontrar o instances',
            error: error.message,
        })
    }
}
