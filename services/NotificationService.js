"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const http_status_codes_1 = require("http-status-codes");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const empty = require('is-empty');
const router = express_1.Router();
const FirebaseAdmin_1 = tslib_1.__importDefault(require("./FirebaseAdmin"));
router.get('/all/:id', (req, res) => {
    CustomerSchema_1.default.findOne({ _id: req.params.id }).select('notify').exec((err, doc) => {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: 'error en la petición de notificaciones' });
            return;
        }
        res.status(200).json(doc);
    });
});
router.get('/allstore/:id', (req, res) => {
    StoreSchema_1.default.findOne({ _id: req.params.id }).select('notify').exec((err, doc) => {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: 'error en la petición de notificaciones' });
            return;
        }
        res.status(200).json(doc);
    });
});
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
router.post('/postfirebase', (req, res) => {
    let registrationToken = req.body.registrationToken;
    let message = req.body.message;
    let options = notification_options;
    const message_notification = {
        notification: {
            title: 'prueba daily',
            body: message
        },
        data: {
            firebase: 'esto es una data desde firebase'
        }
    };
    FirebaseAdmin_1.default.messaging().sendToDevice(registrationToken, message_notification, options)
        .then((response) => {
        console.log("Notification sent successfully");
    })
        .catch((error) => {
        console.log(error);
    });
    res.status(200).json({ message: 'Se envió una notificación' });
});
router.put('/updatecount', (req, res) => {
    let notifyid = req.body.notifyid;
    let userid = req.body.userid;
    console.log(notifyid);
    CustomerSchema_1.default.findOne({ _id: userid }).select('notify').exec((err, doc) => {
        if (!empty(doc)) {
            let indexnotify = doc.notify.findIndex((dat) => { return (dat._id + '') == (notifyid + ''); });
            console.log(indexnotify);
            doc.notify[indexnotify].count = 0;
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'actualizado' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.get('/countnotifications/:id', (req, res) => {
    let userid = req.params.id;
    CustomerSchema_1.default.findOne({ _id: userid }).select('notify').exec((err, doc) => {
        if (!empty(doc)) {
            let sum = 0;
            doc.notify.forEach((element) => {
                if (element.count) {
                    sum += element.count;
                }
                else {
                    sum++;
                }
            });
            console.log('Esto es la suma: ' + sum);
            res.status(200).json({ count: sum });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.get('/countnotificationsStore/:id', (req, res) => {
    let id = req.params.id;
    StoreSchema_1.default.findOne({ _id: id }).select('notify').exec((err, doc) => {
        if (!empty(doc)) {
            res.status(200).json({
                count: doc.notify.count,
                chat: (empty(doc.notify.chats) ? 0 : doc.notify.chats.length),
                buys: (empty(doc.notify.buys) ? 0 : doc.notify.buys.length)
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.post('/getchatid', (req, res) => {
    let userid = req.body.userid;
    let storeid = req.body.storeid;
    let productid = req.body.productid;
    StoreSchema_1.default.findOne({ _id: storeid }).select('products').exec((err, doc) => {
        try {
            let indexprod = doc.products.findIndex((dat) => { return dat._id == productid; });
            let indexchat = doc.products[indexprod].chat.findIndex((dat) => { return (dat.clientid + '') == userid; });
            if (indexchat == -1) {
                doc.products[indexprod].chat.push({
                    clientid: userid,
                    messages: []
                });
                let chatid = doc.products[indexprod].chat[doc.products[indexprod].chat.length - 1]._id;
                StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                    res.status(200).json({ chatid });
                });
            }
            else {
                let chatid = doc.products[indexprod].chat[indexchat]._id;
                res.status(200).json({ chatid });
            }
        }
        catch (error) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: error });
        }
    });
});
exports.default = router;
