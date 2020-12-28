"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const FirebaseAdmin_1 = tslib_1.__importDefault(require("./FirebaseAdmin"));
const jsonQuery = require('json-query');
const empty = require('is-empty');
var responseapp = [];
var responseweb = [];
exports.default = (io) => {
    io.sockets.on('connection', (socket) => {
        socket.on('chatapp', (data) => {
            socket.emit('chatapp', data);
            saveapp(data);
        });
        socket.on('chatweb', (data) => {
            socket.emit('chatweb', data);
            saveweb(data);
        });
        io.sockets.emit('update', '');
        socket.on('idweb', (data) => {
            let socketindex = responseweb.findIndex((dat) => { return dat.socketid == data.socketid; });
            if (socketindex == -1) {
                responseweb.push({
                    storeid: data.storeid,
                    userid: '',
                    socketid: data.socketid
                });
            }
        });
        socket.on('mapstateweb', (data) => {
            let socketindex = responseweb.findIndex((dat) => { return dat.socketid == data.socketid; });
            if (socketindex != -1) {
                responseweb[socketindex].userid = data.userid;
            }
        });
        socket.on('leaveweb', (data) => {
            let socketindex = responseweb.findIndex((dat) => { return dat.socketid == data.socketid; });
            if (socketindex != -1) {
                responseweb[socketindex].userid = '';
            }
            console.log(responseweb);
        });
        socket.on('idapp', (data) => {
            let socketindex = responseapp.findIndex((dat) => { return dat.socketid == data.socketid; });
            if (socketindex == -1) {
                responseapp.push({
                    productid: '',
                    userid: data.userid,
                    socketid: data.socketid
                });
            }
        });
        socket.on('mapstateapp', (data) => {
            let indexuser = responseapp.findIndex((dat) => { return dat.userid == data.userid; });
            if (indexuser != -1) {
                responseapp[indexuser].productid = data.productid;
            }
        });
        socket.on('leaveapp', (data) => {
            let indexuser = responseapp.findIndex((dat) => { return dat.userid == data.userid; });
            if (indexuser != -1) {
                responseapp[indexuser].productid = '';
            }
        });
        socket.on('shopping', (data) => {
            console.log(data);
            let result = jsonQuery('[*storeid=' + data.storeid + ']', { data: responseweb }).value;
            if (!empty(result)) {
                result.forEach((element) => {
                    io.sockets.to(element.socketid).emit('notify1', '');
                    io.sockets.to(element.socketid).emit('notify2', '');
                });
            }
            else {
                const message_notification = {
                    notification: {
                        title: 'Compra',
                        body: 'Alguien acaba de comprar un producto de la tienda'
                    },
                    data: {
                        prueba: 'prueba desde mi mensajeria'
                    }
                };
                data.tokens.forEach((element) => {
                    FirebaseAdmin_1.default.messaging().sendToDevice(element, message_notification, {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                    })
                        .then((response) => {
                        console.log("Notification sent successfully");
                    })
                        .catch((error) => {
                        console.log(error);
                    });
                });
            }
        });
        socket.on('disconnect', () => {
            let socketindex = responseapp.findIndex((dat) => { return dat.socketid == socket.id; });
            let socketindex2 = responseweb.findIndex((dat) => { return dat.socketid == socket.id; });
            if (socketindex != -1) {
                responseapp.splice(socketindex, 1);
            }
            if (socketindex2 != 1) {
                responseweb.splice(socketindex2, 1);
            }
        });
    });
    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };
    function saveweb(data) {
        let productid = data.productid;
        let userid = data.userid;
        let storeid = data.storeid;
        let sellerid = data.sellerid;
        let name = data.name;
        let message = data.message;
        let chatid = data.chatid;
        let options = notification_options;
        StoreSchema_1.default.findOne({ _id: storeid }).select('products').exec((err, doc) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let indexproduct = doc.products.findIndex((dat) => { return dat._id == productid; });
            let notification_create = false;
            let indexchat = doc.products[indexproduct].chat.findIndex((dat) => { return dat._id == chatid; });
            doc.products[indexproduct].chat[indexchat].messages.push({
                idtype: sellerid,
                name,
                message
            });
            let arr = jsonQuery('[*userid=' + userid + ']', { data: responseapp }).value;
            let result = jsonQuery('[*productid=' + productid + ']', { data: arr }).value;
            if (!empty(result)) {
                result.forEach((element) => {
                    io.sockets.to(element.socketid).emit('chatapp', {
                        userid: sellerid,
                        name,
                        message
                    });
                });
            }
            else {
                let user = yield CustomerSchema_1.default.findOne({ _id: userid }).select('notify tokenFirebase');
                let indexnotify = user.notify.findIndex((dat) => { return dat.chatid == chatid; });
                if (indexnotify == -1) {
                    user.notify.push({
                        typenotification: 0,
                        productid,
                        storeid,
                        chatid,
                        name,
                        message,
                        count: 1,
                        date: new Date()
                    });
                }
                else {
                    user.notify[indexnotify].count++;
                    user.notify[indexnotify].date = new Date();
                    user.notify[indexnotify].name = name;
                    user.notify[indexnotify].message = message;
                }
                CustomerSchema_1.default.findByIdAndUpdate(user._id, user, (err2, doc2) => {
                    let result2 = jsonQuery('[*userid=' + userid + ']', { data: responseapp }).value;
                    if (!empty(result2)) {
                        result2.forEach((element) => {
                            io.sockets.to(element.socketid).emit('notify1', '');
                            io.sockets.to(element.socketid).emit('notify2', '');
                        });
                    }
                    else {
                        const message_notification = {
                            notification: {
                                title: name,
                                body: message
                            },
                        };
                        doc2.tokenFirebase.forEach((element) => {
                            FirebaseAdmin_1.default.messaging().sendToDevice(element, message_notification, options)
                                .then((response) => {
                                console.log("Notification sent successfully");
                            })
                                .catch((error) => {
                                console.log(error);
                            });
                        });
                    }
                });
            }
            StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                console.log('store update');
            });
        }));
    }
    function saveapp(data) {
        let productid = data.productid;
        let userid = data.userid;
        let storeid = data.storeid;
        let name = data.name;
        let message = data.message;
        let options = notification_options;
        let chatid = data.chatid;
        StoreSchema_1.default.findOne({ _id: storeid }).select('products notify tokenFirebase').exec((err, doc) => {
            let indexproduct = doc.products.findIndex((dat) => { return dat._id == productid; });
            let notification_create = false;
            let indexchat = doc.products[indexproduct].chat.findIndex((dat) => { return dat._id == chatid; });
            doc.products[indexproduct].chat[indexchat].messages.push({
                idtype: userid,
                name,
                message
            });
            let arr = jsonQuery('[*storeid=' + storeid + ']', { data: responseweb }).value;
            let result = jsonQuery('[*userid=' + userid + ']', { data: arr }).value;
            if (!empty(result)) {
                result.forEach((element) => {
                    io.sockets.to(element.socketid).emit('chatweb', {
                        userid,
                        name,
                        message
                    });
                });
            }
            else {
                notification_create = true;
                let indexnotify = doc.notify.chats.findIndex((dat) => { return dat.chatid == chatid; });
                if (indexnotify == -1) {
                    doc.notify.count++;
                    doc.notify.chats.push({
                        chatid,
                        userid,
                        name,
                        productid,
                        message,
                        count: 1,
                        date: new Date()
                    });
                }
                else {
                    if (doc.notify.chats[indexnotify].count == 0) {
                        doc.notify.count++;
                    }
                    doc.notify.chats[indexnotify].count++;
                    doc.notify.chats[indexnotify].date = new Date();
                    doc.notify.chats[indexnotify].name = name;
                    doc.notify.chats[indexnotify].message = message;
                }
            }
            StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                if (notification_create) {
                    let result2 = jsonQuery('[*storeid=' + storeid + ']', { data: responseweb }).value;
                    if (!empty(result2)) {
                        result2.forEach((element) => {
                            io.sockets.to(element.socketid).emit('notify2', '');
                            io.sockets.to(element.socketid).emit('notify1', '');
                        });
                    }
                    else {
                        const message_notification = {
                            notification: {
                                title: name,
                                body: message
                            },
                        };
                        doc.tokenFirebase.forEach((element) => {
                            FirebaseAdmin_1.default.messaging().sendToDevice(element, message_notification, options)
                                .then((response) => {
                                console.log("Notification sent successfully");
                            })
                                .catch((error) => {
                                console.log(error);
                            });
                        });
                    }
                }
            });
        });
    }
};
