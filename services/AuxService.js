"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const empty = require('is-empty');
const router = express_1.Router();
router.post('/auxs', (req, res) => {
    let userid = req.body.userid;
    let storeid = req.body.storeid;
    StoreSchema_1.default.findOne({ $and: [{ idcustomer: userid }, { _id: storeid }] }).select('auxs').exec((err, doc) => {
        if (empty(doc)) {
            res.status(200).json({
                message: 'Error ud no tiene permiso',
                arr: []
            });
        }
        else {
            res.status(200).json({
                message: 'Estos son los ayudantes',
                arr: doc.auxs
            });
        }
    });
});
router.post('/email', (req, res) => {
    let userid = req.body.userid;
    let email = req.body.email;
    StoreSchema_1.default.findOne({ idcustomer: userid }).select('auxs').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            res.status(200).json({
                message: 'Error ud no tiene permiso',
                btn1: false,
                btn2: false
            });
        }
        else {
            let user = yield CustomerSchema_1.default.findOne({ $or: [{ 'xpressdata.email': email }, { 'googledata.email': email }, { 'facebookdata.email': email }] }).select('auxStore');
            if (empty(user)) {
                res.status(200).json({
                    message: 'No existe el correo, puede crear al usuario',
                    btn1: true,
                    btn2: false
                });
            }
            else {
                res.status(200).json({
                    message: 'Correo verificado, puede volver colaborador al usuario',
                    btn1: false,
                    btn2: true
                });
            }
        }
    }));
});
router.post('/helpercreate1', (req, res) => {
    let userid = req.body.userid;
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let phone = req.body.phone;
    let password = req.body.password;
    let arr = [];
    StoreSchema_1.default.findOne({ idcustomer: userid }).select('auxs storename').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            res.status(200).json({
                message: 'Error ud no tiene permiso',
                arr
            });
        }
        else {
            const softCustomer = new CustomerSchema_1.default({
                xpressdata: {
                    avaible: true,
                    firstname,
                    lastname,
                    password,
                    email,
                    profilePhoto: '',
                    realpathPhoto: '',
                    phone,
                    country: '',
                    state: '',
                },
                facebookdata: { avaible: false },
                googledata: { avaible: false },
                seller: false,
                points: 0,
                codePassForgot: -1,
                date: new Date(),
                history: [],
                auxStore: {
                    stateaux: false,
                    storeIndicator: '',
                    stores: [{
                            name: doc.storename,
                            storeid: doc._id
                        }]
                }
            });
            yield softCustomer.save();
            let objectresponse = null;
            objectresponse = {
                userid: softCustomer._id,
                name: firstname,
                date: new Date(),
                photo: ''
            };
            doc.auxs.push(objectresponse);
            arr.push(objectresponse);
            StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({
                    message: 'El usuario ahora es colaborador de la tienda',
                    arr
                });
            });
        }
    }));
});
router.post('/helpercreate2', (req, res) => {
    let userid = req.body.userid;
    let email = req.body.email;
    let arr = [];
    StoreSchema_1.default.findOne({ idcustomer: userid }).select('auxs storename').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            res.status(200).json({
                message: 'Error ud no tiene permiso',
                arr
            });
        }
        else {
            let user = yield CustomerSchema_1.default.findOne({ $or: [{ 'xpressdata.email': email }, { 'googledata.email': email }, { 'facebookdata.email': email }] }).select('auxStore xpressdata googledata facebookdata');
            if (user._id + '' == userid) {
                res.status(200).json({
                    message: 'El administrador no puede ser colaborador',
                    arr
                });
            }
            else {
                let indexstore = user.auxStore.stores.findIndex((dat) => { return dat.storeid + '' == doc._id + ''; });
                if (indexstore == -1) {
                    user.auxStore.stores.push({
                        name: doc.storename,
                        storeid: doc._id
                    });
                    yield CustomerSchema_1.default.findByIdAndUpdate(user._id, user);
                    let objectresponse = null;
                    if (user.facebookdata.avaible) {
                        objectresponse = {
                            userid: user._id,
                            name: user.facebookdata.firstname,
                            date: new Date(),
                            photo: user.facebookdata.profilePhoto
                        };
                        doc.auxs.push(objectresponse);
                    }
                    else if (user.googledata.avaible) {
                        objectresponse = {
                            userid: user._id,
                            name: user.googledata.firstname,
                            date: new Date(),
                            photo: user.googledata.profilePhoto
                        };
                        doc.auxs.push(objectresponse);
                    }
                    else if (user.xpressdata.avaible) {
                        objectresponse = {
                            userid: user._id,
                            name: user.xpressdata.firstname,
                            date: new Date(),
                            photo: user.xpressdata.profilePhoto
                        };
                        doc.auxs.push(objectresponse);
                    }
                    arr.push(objectresponse);
                    StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                        res.status(200).json({
                            message: 'El usuario ahora es colaborador de la tienda',
                            arr
                        });
                    });
                }
                else {
                    res.status(200).json({
                        message: 'El usuario ya es colaborador de la tienda',
                        arr
                    });
                }
            }
        }
    }));
});
exports.default = router;
