const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/advertiserController');
const { authenticateAdvertiser, authenticateUser } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');

router.post('/register',      validate(schemas.advertiserRegister), ctrl.register);
router.post('/login',         validate(schemas.advertiserLogin),    ctrl.login);
router.post('/createAd',      authenticateUser, validate(schemas.createAd),    ctrl.createAd);
router.get('/ads',            authenticateUser, ctrl.getAds);
router.post('/fundAccount',   authenticateAdvertiser, validate(schemas.fundAccount),  ctrl.fundAccount);
router.post('/payment/init',  authenticateAdvertiser, ctrl.verifyPayment);

module.exports = router;