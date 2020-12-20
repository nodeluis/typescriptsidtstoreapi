"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = tslib_1.__importDefault(require("@shared/Logger"));
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const empty = require('is-empty');
exports.default = (io) => {
    io.sockets.on('connection', (socket) => {
        Logger_1.default.info(socket.id);
        socket.on('captureid', (data) => {
            let socket = data.socketid;
            let userid = data.userid;
            CustomerSchema_1.default.findOne({ _id: userid }).select('socket').exec((err, doc) => {
                if (!empty(doc)) {
                    let indexsock = doc.socket.findIndex((dat) => { return dat.socketid == socket; });
                    if (indexsock == -1) {
                        doc.socket.push({
                            user: '',
                            product: '',
                            socketid: socket
                        });
                        CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                            console.log('socket asociado');
                        });
                    }
                }
            });
        });
        socket.on('updateapp', (data) => {
            let socket = data.socketid;
            let userid = data.userid;
            let product = data.productid;
            CustomerSchema_1.default.findOne({ _id: userid }).select('socket').exec((err, doc) => {
                if (!empty(doc)) {
                    let indexsock = doc.socket.findIndex((dat) => { return dat.socketid == socket; });
                    if (indexsock == -1) {
                        doc.socket.push({
                            user: '',
                            product: product,
                            socketid: socket
                        });
                    }
                    else {
                        doc.socket[indexsock] = {
                            user: '',
                            product: product,
                            socketid: socket
                        };
                    }
                    CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                        console.log('Se ha actualizado el socket');
                    });
                }
            });
        });
        socket.on('updatestore', (data) => {
            let socket = data.socketid;
            let userid = data.userid;
            let client = data.client;
            CustomerSchema_1.default.findOne({ _id: userid }).select('socket').exec((err, doc) => {
                if (!empty(doc)) {
                    let indexsock = doc.socket.findIndex((dat) => { return dat.socketid == socket; });
                    if (indexsock == -1) {
                        doc.socket.push({
                            user: client,
                            product: '',
                            socketid: socket
                        });
                    }
                    else {
                        doc.socket[indexsock] = {
                            user: client,
                            product: '',
                            socketid: socket
                        };
                    }
                    CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                        console.log('Se ha actualizado el socket');
                    });
                }
            });
        });
        socket.on('chat', (data) => {
            console.log(data);
        });
        socket.on('disconnect', () => {
            CustomerSchema_1.default.findOne({ 'socket.socketid': socket.id }).select('socket').exec((err, doc) => {
                if (!empty(doc)) {
                    let indexsockelim = doc.socket.findIndex((dat) => { return dat.socketid == socket.id; });
                    doc.socket.splice(indexsockelim, 1);
                    CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                        console.log('socket eliminado');
                    });
                }
            });
        });
    });
};
