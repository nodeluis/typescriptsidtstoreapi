"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const FirebaseAdmin_1 = tslib_1.__importDefault(require("./FirebaseAdmin"));
const jsonQuery = require('json-query');
const empty = require('is-empty');
var responsedata = [];
exports.default = (io) => {
    io.sockets.on('connection', (socket) => {
        socket.on('chat', (data) => {
            save(data);
        });
        socket.on('captureid', (data) => {
            if (data.userid != '') {
                let socketindex = responsedata.findIndex((dat) => { return dat.socketid == data.socketid; });
                if (socketindex == -1) {
                    responsedata.push({
                        userid: data.userid,
                        socketid: data.socketid
                    });
                }
            }
            console.log(responsedata);
        });
        socket.on('shopping', (data) => {
            console.log(data);
            let result = jsonQuery('[*userid=' + data.userid + ']', { data: responsedata }).value;
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
            let socketindex = responsedata.findIndex((dat) => { return dat.socketid == socket.id; });
            responsedata.splice(socketindex, 1);
            console.log(responsedata);
        });
    });
    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };
    function save(data) {
        let productid = data.productid;
        let userid = data.userid;
        let storeid = data.storeid;
        let creattor = data.creattor;
        let name = data.name;
        let message = data.message;
        let options = notification_options;
        StoreSchema_1.default.findOne({ _id: storeid }).select('idcustomer products').exec((err, doc) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let prodindex = doc.products.findIndex((dat) => { return dat._id == productid; });
            let prod = doc.products[prodindex];
            if (!empty(data.chatid) && data.chatid != '') {
                let chatid = data.chatid;
                let indexchat = prod.chat.findIndex((dat) => { return dat._id == chatid; });
                let user = yield CustomerSchema_1.default.findOne({ _id: (userid == doc.idcustomer ? prod.chat[indexchat].clientid : doc.idcustomer) }).select('notify tokenFirebase');
                if (userid == doc.idcustomer) {
                    let result1 = jsonQuery('[*userid=' + userid + ']', { data: responsedata }).value;
                    let result2 = jsonQuery('[*userid=' + prod.chat[indexchat].clientid + ']', { data: responsedata }).value;
                    if (!empty(result1)) {
                        result1.forEach((element) => {
                            io.sockets.to(element.socketid).emit('chat', data);
                            io.sockets.to(element.socketid).emit('notify1', '');
                            io.sockets.to(element.socketid).emit('notify2', '');
                        });
                    }
                    if (!empty(result2)) {
                        result2.forEach((element) => {
                            io.sockets.to(element.socketid).emit('chat', data);
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
                            data: {
                                prueba: 'prueba desde mi mensajeria'
                            }
                        };
                        user.tokenFirebase.forEach((element, i) => {
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
                else {
                    let result1 = jsonQuery('[*userid=' + userid + ']', { data: responsedata }).value;
                    let result2 = jsonQuery('[*userid=' + doc.idcustomer + ']', { data: responsedata }).value;
                    if (!empty(result1)) {
                        result1.forEach((element) => {
                            io.sockets.to(element.socketid).emit('chat', data);
                            io.sockets.to(element.socketid).emit('notify1', '');
                            io.sockets.to(element.socketid).emit('notify2', '');
                        });
                    }
                    if (!empty(result2)) {
                        result2.forEach((element) => {
                            io.sockets.to(element.socketid).emit('chat', data);
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
                            data: {
                                prueba: 'prueba desde mi mensajeria'
                            }
                        };
                        user.tokenFirebase.forEach((element, i) => {
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
                doc.products[prodindex].chat[indexchat].messages.push({
                    idtype: userid,
                    name,
                    message
                });
                let indexnotify = user.notify.findIndex((dat) => { return dat.chatid == chatid; });
                if (indexnotify == -1) {
                    user.notify.push({
                        typenotification: 0,
                        productid,
                        storeid,
                        chatid,
                        creattor,
                        name,
                        count: 1,
                        date: new Date()
                    });
                }
                else {
                    user.notify[indexnotify].count += 1;
                    user.notify[indexnotify].date = new Date();
                }
                CustomerSchema_1.default.findByIdAndUpdate(user._id, user, () => {
                    console.log('user notify with id chat');
                });
            }
            else {
                let indexchat = prod.chat.findIndex((dat) => { return dat.clientid == userid; });
                let user = yield CustomerSchema_1.default.findOne({ _id: creattor }).select('notify tokenFirebase');
                let result1 = jsonQuery('[*userid=' + userid + ']', { data: responsedata }).value;
                let result2 = jsonQuery('[*userid=' + creattor + ']', { data: responsedata }).value;
                if (!empty(result1)) {
                    result1.forEach((element) => {
                        io.sockets.to(element.socketid).emit('chat', data);
                        io.sockets.to(element.socketid).emit('notify1', '');
                        io.sockets.to(element.socketid).emit('notify2', '');
                    });
                }
                if (!empty(result2)) {
                    result2.forEach((element) => {
                        io.sockets.to(element.socketid).emit('chat', data);
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
                        data: {
                            prueba: 'prueba desde mi mensajeria'
                        }
                    };
                    user.tokenFirebase.forEach((element, i) => {
                        FirebaseAdmin_1.default.messaging().sendToDevice(element, message_notification, options)
                            .then((response) => {
                            console.log("Notification sent successfully");
                        })
                            .catch((error) => {
                            console.log(error);
                        });
                    });
                }
                let chatid;
                if (indexchat == -1) {
                    doc.products[prodindex].chat.push({
                        clientid: userid,
                        messages: [{
                                idtype: userid,
                                name,
                                message
                            }]
                    });
                    chatid = doc.products[prodindex].chat[doc.products[prodindex].chat.length - 1]._id;
                }
                else {
                    doc.products[prodindex].chat[indexchat].messages.push({
                        idtype: userid,
                        name,
                        message
                    });
                    chatid = doc.products[prodindex].chat[indexchat]._id;
                }
                let indexnotify = user.notify.findIndex((dat) => { return dat.chatid == chatid; });
                if (indexnotify == -1) {
                    user.notify.push({
                        typenotification: 0,
                        productid,
                        storeid,
                        chatid,
                        creattor,
                        name,
                        count: 1,
                        date: new Date()
                    });
                }
                else {
                    user.notify[indexnotify].count += 1;
                    user.notify[indexnotify].date = new Date();
                }
                CustomerSchema_1.default.findByIdAndUpdate(user._id, user, () => {
                    console.log('user notify with id chat');
                });
            }
            StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                console.log('product update');
            });
        }));
    }
};
