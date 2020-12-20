"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const Tesseract = require('tesseract.js');
const empty = require('is-empty');
const router = express_1.Router();
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient({
    keyFilename: __dirname + '/../apivisiongoogle.json'
});
router.post('/', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let files = req.files;
    let file = files.img;
    yield file.mv(__dirname + '/../datauserimages/' + file.name, (err) => {
        if (err) {
            console.log(err);
            return;
        }
    });
    let image = fs_1.default.readFileSync(__dirname + '/../datauserimages/' + file.name, {
        encoding: null
    });
    res.status(200).json({ message: 'funciona' });
}));
router.post('/apivision', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let files = req.files;
    let file = files.img;
    yield file.mv(__dirname + '/../datauserimages/' + file.name, (err) => {
        if (err) {
            console.log(err);
            return;
        }
    });
    const [result] = yield client.textDetection(__dirname + '/../datauserimages/' + file.name);
    const detections = result.textAnnotations;
    console.log('Text:');
    detections.forEach((text) => console.log(text));
    res.status(200).json({ message: 'funciona' });
}));
router.post('/identificationcard', (req, res) => {
    let files = req.files;
    let userid = req.body.userid;
    console.log(files);
    CustomerSchema_1.default.findOne({ _id: userid }).select('verificationUser').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            let file = files.img;
            let date = new Date();
            let token = sha1_1.default(date.toString()).substr(0, 7);
            let nameAccount = token + "_" + file.name;
            yield file.mv(__dirname + '/../datauserimages/' + nameAccount, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
            try {
                doc.verificationUser.dataIdentificationCard = {
                    avaible: true,
                    photo: __dirname + '/../datauserimages/' + nameAccount,
                    getPhoto: '/api/v1/customer/dataIdentificationCard/' + doc._id,
                    textCard: {
                        textIdentification: ''
                    }
                };
                CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                    res.status(200).json({ message: 'Se envio el carnet' });
                });
            }
            catch (error) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error Vuelva a iniciar Sesión, o envie nuevamente la imagen' });
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error Vuelva a iniciar Sesión, o envie nuevamente la imagen' });
        }
    }));
});
router.post('/identificationselfie', (req, res) => {
    let files = req.files;
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('verificationUser').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            let file = files.img;
            let date = new Date();
            let token = sha1_1.default(date.toString()).substr(0, 7);
            let namePhoto = token + "_" + file.name;
            yield file.mv(__dirname + '/../datauserimages/' + namePhoto, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
            doc.verificationUser.dataProfile = {
                avaible: true,
                selfie: __dirname + '/../datauserimages/' + namePhoto,
                getSelfie: '/api/v1/customer/dataProfile/' + doc._id,
            };
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'Se envió la imagen' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error Vuelva a iniciar Sesión, o envie nuevamente la imagen' });
        }
    }));
});
router.post('/identificationdata', (req, res) => {
    let code = req.body.code;
    let fingerprint = req.body.fingerprint;
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('verificationUser').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            if (fingerprint == '') {
                doc.verificationUser.codeDigit = {
                    avaible: true,
                    code: parseInt(code)
                };
                doc.verificationUser.fingerPrint = {
                    avaible: false,
                    code: ''
                };
            }
            else {
                doc.verificationUser.codeDigit = {
                    avaible: false,
                    code: 0
                };
                doc.verificationUser.fingerPrint = {
                    avaible: true,
                    code: fingerprint
                };
            }
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'Se envió los datos' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error Vuelva a iniciar Sesión, o envie nuevamente la imagen' });
        }
    }));
});
exports.default = router;
