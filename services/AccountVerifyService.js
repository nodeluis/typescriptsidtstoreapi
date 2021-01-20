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


const {Storage}=require('@google-cloud/storage');
const Multer=require('multer');
const gc=new Storage({
    keyFilename:__dirname + '/../apivisiongoogle.json',
    projectId:'rosy-environs-268816'
});

const multer=Multer({
    storage:Multer.memoryStorage()
});

const bucket=gc.bucket(process.env.GCLOUD_STORAGE_BUCKET||'bucket_prueba_sis719_2');

router.post('/identificationcard',multer.single('img'), (req, res) => {
    //let files = req.files;
    let userid = req.body.userid;    
    console.log(req.file);
    
    CustomerSchema_1.default.findOne({ _id: userid }).select('verificationUser').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            let date = new Date();
            let token = sha1_1.default(date.toString()).substr(0, 7);

            const blob=bucket.file(req.file.originalname);
            const blobStream=blob.createWriteStream({
                resumable:true
            });

            blobStream.on('error',(err)=>{
                res.json({message:err});
            });

            blobStream.on('finish',async()=>{
                let path = 'https://storage.googleapis.com/'+bucket.name+'/'+blob.name;

                try {
                    const [result] = await client.textDetection(path);
                    const detections = result.textAnnotations;
                    console.log(detections[0].description);
                    
                    doc.verificationUser.dataIdentificationCard = {
                        avaible: true,
                        photo:'',
                        getPhoto: path,
                        textCard: {
                            textIdentification: detections[0].description
                        }
                    };
                    CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                        res.status(200).json({ message: 'Se envio el carnet' });
                    });
                }
                catch (error) {
                    console.log(error);
                    
                    res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error Vuelva a iniciar Sesión, o envie nuevamente la imagen' });
                }
                
            });

            blobStream.end(req.file.buffer);
            
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error Vuelva a iniciar Sesión, o envie nuevamente la imagen' });
        }
    }));
});
router.post('/identificationselfie',multer.single('img'), (req, res) => {
    //let files = req.files;
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('verificationUser').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            let date = new Date();
            let token = sha1_1.default(date.toString()).substr(0, 7);

            const blob=bucket.file(token+'_'+req.file.originalname);
            const blobStream=blob.createWriteStream({
                resumable:true
            });

            blobStream.on('error',(err)=>{
                res.json({message:err});
            });

            blobStream.on('finish',async()=>{
                console.log('se envio');
                
            });

            blobStream.end(req.file.buffer);
            let path = 'https://storage.googleapis.com/'+bucket.name+'/'+blob.name;
            doc.verificationUser.dataProfile = {
                avaible: true,
                selfie:'',
                getSelfie: path,
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
