const express = require('express')
const controller = require('../controllers/instance.controller')
const keyVerify = require('../middlewares/keyCheck')
const loginVerify = require('../middlewares/loginCheck')

const router = express.Router()
router.route('/init').get(controller.init)
router.route('/initpura').get(controller.initPure)
router.route('/qr').get(keyVerify, controller.qr)
router.route('/qrbase64').get(keyVerify, controller.qrbase64)
router.route('/info').get(keyVerify, controller.info)
router.route('/restore').get(controller.restore)
router.route('/logout').delete(keyVerify, loginVerify, controller.logout)
router.route('/delete').delete(keyVerify, controller.delete)
router.route('/list').get(controller.list)

router.route('/criaruser').post(controller.CreateUser)
router.route('/loginuser').post(controller.UserLogin)
router.route('/getuser').get(controller.GetUser)
router.route('/getinstanceuser').get(controller.GetInstanceUser)

router.route('/sandListModal').get(controller.SandListModal)
router.route('/getSandList').get(controller.getSandList)

module.exports = router
