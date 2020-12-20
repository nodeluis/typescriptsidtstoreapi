"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const empty = require('is-empty');
const router = express_1.Router();
router.put('/saveProduct', (req, res) => {
    let productid = req.body.productid;
    let userid = req.body.userid;
    let storeid = req.body.storeid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (!empty(doc)) {
            let objectproduct = {
                date: new Date(),
                total: 1,
                product: productid,
                store: storeid,
                cash: false,
                card: false,
                tokencard: ''
            };
            doc.shoppingcart.push(objectproduct);
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({
                    message: 'El producto esta ahora en su carrito de compras'
                });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.put('/cashpayment', (req, res) => {
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (!empty(doc)) {
            doc.shoppingcart.forEach((element) => {
                element.cash = true;
                element.card = false;
                element.tokencard = '';
            });
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(http_status_codes_1.OK).json({ message: 'El metodo que ud. eligió como modo de pago es efectivo para todas sus compras' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.put('/cardpayment', (req, res) => {
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (!empty(doc)) {
            doc.shoppingcart.forEach((element) => {
                element.cash = false;
                element.card = true;
                element.tokencard = 'some token card';
            });
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(http_status_codes_1.OK).json({ message: 'El metodo que ud. eligió como modo de pago es tarjeta para todas sus compras' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.get('/directions/:id', (req, res) => {
    let id = req.params.id;
    CustomerSchema_1.default.findOne({ _id: id }).select('sendAddress').exec((err, doc) => {
        if (!empty(doc)) {
            res.status(200).json(doc.sendAddress);
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.put('/setdirecton', (req, res) => {
    let userid = req.body.userid;
    let departament = req.body.departament;
    let city = req.body.city;
    let street = req.body.street;
    let nro = parseInt(req.body.nro);
    let reference = req.body.reference;
    let codeplus = req.body.codeplus;
    CustomerSchema_1.default.findOne({ _id: userid }).select('sendAddress').exec((err, doc) => {
        if (!empty(doc)) {
            doc.sendAddress.push({
                state: false,
                departament,
                city,
                street,
                nro,
                reference,
                codeplus
            });
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'Los datos se enviaron' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error al agregar una dirección', err });
        }
    });
});
router.put('/updatedirecton', (req, res) => {
    let userid = req.body.userid;
    let directionid = req.body._id;
    CustomerSchema_1.default.findOne({ _id: userid }).select('sendAddress').exec((err, doc) => {
        if (!empty(doc)) {
            let index = doc.sendAddress.findIndex((dat) => { return dat._id == directionid; });
            req.body.state = doc.sendAddress[index].state;
            doc.sendAddress[index] = req.body;
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'Los datos se enviaron' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.put('/deletedirecton', (req, res) => {
    let userid = req.body.userid;
    let directionid = req.body.directionid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('sendAddress').exec((err, doc) => {
        if (!empty(doc)) {
            let index = doc.sendAddress.findIndex((dat) => { return dat._id == directionid; });
            doc.sendAddress.splice(index, 1);
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'Se eliminó la dirección' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.put('/updatestate', (req, res) => {
    let userid = req.body.userid;
    let directionid = req.body.directionid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('sendAddress').exec((err, doc) => {
        if (!empty(doc)) {
            doc.sendAddress.forEach((element, i) => {
                if (element._id == directionid) {
                    element.state = true;
                }
                else {
                    element.state = false;
                }
            });
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'Se actualizo el estado' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.get('/inmycart', (req, res) => {
    let productid = req.query.productid;
    let userid = req.query.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (!empty(doc)) {
            let prodindex = doc.shoppingcart.findIndex((dat) => { return dat.product == productid; });
            if (prodindex == -1) {
                res.status(200).json({ inCart: false, message: 'Detalles del producto' });
            }
            else {
                res.status(200).json({ inCart: true, message: 'Este producto ya se encuentra en su carrito' });
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Para poder hacer una compra necesita estar autenticado' });
        }
    });
});
router.get('/countProdCart/:id', (req, res) => {
    let userid = req.params.id;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (!empty(doc)) {
            let count = doc.shoppingcart.length;
            console.log(doc);
            res.status(200).json({ count });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.get('/myCart/:id', (req, res) => {
    let userid = req.params.id;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            if (userid == '') {
                res.status(200).json({ message: 'Uds no esta autenticado', arr: [] });
            }
            else {
                res.status(200).json({ message: 'No tiene productos en su carrito', arr: [] });
            }
        }
        else {
            let responsedata = [];
            for (let index = 0; index < doc.shoppingcart.length; index++) {
                const ele = doc.shoppingcart[index];
                let prod = yield StoreSchema_1.default.findOne({ _id: ele.store }).
                    select('products products.quantityavailable products.productname products.description products.price products.discount products.likes products.pricesend products._id');
                let productindex = prod.products.findIndex((dat) => { return (dat._id + '') == (ele.product + ''); });
                if (productindex != -1) {
                    let ob = prod.products[productindex];
                    responsedata.push({
                        productname: ob.productname,
                        description: ob.description,
                        price: ob.price,
                        discount: ob.discount,
                        likes: ob.likes,
                        pricesend: ob.pricesend,
                        quantityavailable: ob.quantityavailable,
                        total: ele.total,
                        date: ele.date,
                        _id: ele._id
                    });
                }
            }
            res.status(200).json({ message: 'Este es tu carrito', arr: responsedata });
        }
    }));
});
router.post('/chatsolve', (req, res) => {
    let storeid = req.body.storeid;
    let productid = req.body.productid;
    let chatid = req.body.chatid;
    StoreSchema_1.default.findOne({
        'products.chat._id': chatid
    }).select('products products.chat products.chat.messages').where('products.chat._id').equals(chatid)
        .exec((err, doc) => {
        if (!empty(doc)) {
            res.status(200).json(doc);
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json(err);
        }
    });
});
router.put('/removeitem', (req, res) => {
    let userid = req.query.userid;
    let cartid = req.query.cartid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (doc) {
            let indexcart = doc.shoppingcart.findIndex((dat) => { return (dat._id + '') == (cartid + ''); });
            if (indexcart == -1) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'error al eliminar' });
            }
            else {
                doc.shoppingcart.splice(indexcart, 1);
                CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                    res.status(200).json({ message: 'Se ha eliminado de tu carrito' });
                });
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'error al eliminar' });
        }
    });
});
router.put('/itemminus', (req, res) => {
    let userid = req.query.userid;
    let cartid = req.query.cartid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (doc) {
            let indexcart = doc.shoppingcart.findIndex((dat) => { return (dat._id + '') == (cartid + ''); });
            if (indexcart == -1) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'error al disminuir' });
            }
            else {
                doc.shoppingcart[indexcart].total -= 1;
                CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                    res.status(200).json({ message: 'Se ha disminuido el pedido' });
                });
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'error al disminuir' });
        }
    });
});
router.put('/itemmore', (req, res) => {
    let userid = req.query.userid;
    let cartid = req.query.cartid;
    let quantityavailable = req.query.quantityavailable;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart').exec((err, doc) => {
        if (!empty(doc)) {
            let indexcart = doc.shoppingcart.findIndex((dat) => { return (dat._id + '') == (cartid + ''); });
            if (indexcart == -1) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'error al aumentar' });
            }
            else {
                if (doc.shoppingcart[indexcart].total < parseInt(quantityavailable)) {
                    doc.shoppingcart[indexcart].total += 1;
                    CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                        res.status(200).json({ message: 'Se ha aumentado el pedido' });
                    });
                }
                else {
                    res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'No existe mas cantidad disponible' });
                }
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'error al aumentar' });
        }
    });
});
router.get('/detailssenddata/:id', (req, res) => {
    let userid = req.params.id;
    CustomerSchema_1.default.findOne({ _id: userid }).select('sendAddress').exec((err, doc) => {
        if (!empty(doc)) {
            if (doc.sendAddress.length == 0) {
                res.status(http_status_codes_1.OK).json({
                    message: 'Ud no cuenta con una direccion de envio, si desea recoger en tienda seleccione la opcion por favor',
                    st: true
                });
            }
            else {
                let indexstate = doc.sendAddress.findIndex((dat) => { dat.state == true; });
                if (indexstate == -1) {
                    res.status(http_status_codes_1.OK).json({
                        message: 'Por favor habilite dirección de envio, o seleccione la opción de recoger en tienda',
                        st: true
                    });
                }
                else {
                    res.status(http_status_codes_1.OK).json({
                        message: 'Su direccion de envio esta habilitada',
                        st: false
                    });
                }
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    });
});
router.put('/savedatapayment/send', (req, res) => {
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart sendAddress history').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            let arr = [];
            let rejects = [];
            let indexaddress = doc.sendAddress.findIndex((dat) => { return dat.state == true; });
            for (let index = 0; index < doc.shoppingcart.length;) {
                const element = doc.shoppingcart[index];
                if (element.card) {
                    let store = yield StoreSchema_1.default.findOne({ _id: element.store }).select('products idcustomer sales');
                    let indexproduct = store.products.findIndex((dat) => { return (dat._id + '') == (element.product + ''); });
                    let disponible = store.products[indexproduct].quantityavailable - element.total;
                    if (disponible >= 0) {
                        let price = store.products[indexproduct].price * element.total;
                        store.products[indexproduct].quantityavailable -= element.total;
                        store.sales.push({
                            date: new Date(),
                            total: element.total,
                            product: element.product,
                            buyer: userid
                        });
                        yield StoreSchema_1.default.findByIdAndUpdate(store._id, store);
                        let user = yield CustomerSchema_1.default.findOne({ _id: store.idcustomer }).select('notify tokenFirebase');
                        user.notify.push({
                            typenotification: 1,
                            storeid: element.store,
                            productid: element.product,
                            card: true,
                            cash: false,
                            send: true,
                            userid: userid,
                            direction: doc.sendAddress[indexaddress]._id
                        });
                        arr.push({
                            userid: user._id,
                            tokens: user.tokenFirebase
                        });
                        yield CustomerSchema_1.default.findByIdAndUpdate(user._id, user);
                        let pushcart = doc.shoppingcart[index];
                        doc.history.push({
                            date: new Date(),
                            total: pushcart.total,
                            product: pushcart.product,
                            store: pushcart.store,
                            cash: false,
                            card: true,
                        });
                        doc.shoppingcart.splice(index, 1);
                    }
                    else {
                        rejects.push(element);
                        index++;
                    }
                }
                else {
                    let store = yield StoreSchema_1.default.findOne({ _id: element.store }).select('idcustomer sales');
                    let user = yield CustomerSchema_1.default.findOne({ _id: store.idcustomer }).select('notify tokenFirebase');
                    user.notify.push({
                        typenotification: 1,
                        storeid: element.store,
                        productid: element.product,
                        card: false,
                        cash: true,
                        send: true,
                        userid: userid,
                        direction: doc.sendAddress[indexaddress]._id
                    });
                    arr.push({
                        userid: user._id,
                        tokens: user.tokenFirebase
                    });
                    yield CustomerSchema_1.default.findByIdAndUpdate(user._id, user);
                    store.sales.push({
                        date: new Date(),
                        total: element.total,
                        product: element.product,
                        buyer: userid
                    });
                    yield StoreSchema_1.default.findByIdAndUpdate(store._id, store);
                    let pushcart = doc.shoppingcart[index];
                    doc.history.push({
                        date: new Date(),
                        total: pushcart.total,
                        product: pushcart.product,
                        store: pushcart.store,
                        cash: false,
                        card: true,
                    });
                    doc.shoppingcart.splice(index, 1);
                }
            }
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(http_status_codes_1.OK).json({ message: 'Su compra esta en curso', data: arr, rejects });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    }));
});
router.put('/savedatapayment/store', (req, res) => {
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart sendAddress history').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            let arr = [];
            let rejects = [];
            for (let index = 0; index < doc.shoppingcart.length;) {
                const element = doc.shoppingcart[index];
                if (element.card) {
                    let store = yield StoreSchema_1.default.findOne({ _id: element.store }).select('products idcustomer sales');
                    let indexproduct = store.products.findIndex((dat) => { return (dat._id + '') == (element.product + ''); });
                    let disponible = store.products[indexproduct].quantityavailable - element.total;
                    if (disponible >= 0) {
                        let price = store.products[indexproduct].price * element.total;
                        store.products[indexproduct].quantityavailable -= element.total;
                        store.sales.push({
                            date: new Date(),
                            total: element.total,
                            product: element.product,
                            buyer: userid
                        });
                        yield StoreSchema_1.default.findByIdAndUpdate(store._id, store);
                        let user = yield CustomerSchema_1.default.findOne({ _id: store.idcustomer }).select('notify tokenFirebase');
                        user.notify.push({
                            typenotification: 1,
                            storeid: element.store,
                            productid: element.product,
                            card: element.card,
                            cash: element.cash,
                            send: false,
                            userid: userid,
                            direction: ''
                        });
                        arr.push({
                            userid: user._id,
                            tokens: user.tokenFirebase
                        });
                        yield CustomerSchema_1.default.findByIdAndUpdate(user._id, user);
                        let pushcart = doc.shoppingcart[index];
                        doc.history.push({
                            date: new Date(),
                            total: pushcart.total,
                            product: pushcart.product,
                            store: pushcart.store,
                            cash: false,
                            card: true,
                        });
                        doc.shoppingcart.splice(index, 1);
                    }
                    else {
                        rejects.push(element);
                        index++;
                    }
                }
                else {
                    let store = yield StoreSchema_1.default.findOne({ _id: element.store }).select('idcustomer sales');
                    let user = yield CustomerSchema_1.default.findOne({ _id: store.idcustomer }).select('notify tokenFirebase');
                    user.notify.push({
                        typenotification: 1,
                        storeid: element.store,
                        productid: element.product,
                        card: element.card,
                        cash: element.cash,
                        send: false,
                        userid: userid,
                        direction: ''
                    });
                    arr.push({
                        userid: user._id,
                        tokens: user.tokenFirebase
                    });
                    yield CustomerSchema_1.default.findByIdAndUpdate(user._id, user);
                    store.sales.push({
                        date: new Date(),
                        total: element.total,
                        product: element.product,
                        buyer: userid
                    });
                    yield StoreSchema_1.default.findByIdAndUpdate(store._id, store);
                    let pushcart = doc.shoppingcart[index];
                    doc.history.push({
                        date: new Date(),
                        total: pushcart.total,
                        product: pushcart.product,
                        store: pushcart.store,
                        cash: false,
                        card: true,
                    });
                    doc.shoppingcart.splice(index, 1);
                }
            }
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(http_status_codes_1.OK).json({ message: 'Su compra esta en curso', data: arr, rejects });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    }));
});
router.put('/reportSaleNotification', (req, res) => {
    let userid = req.body.userid;
    let productid = req.body.productid;
    let storeid = req.body.storeid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('notify').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            doc.notify.push({
                typenotification: 2,
                date: new Date,
                productid,
                storeid,
                title: 'Mercado Xpress',
                description: 'Se ha realizado el envio, o recojo de tu producto por favor califícanos'
            });
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(http_status_codes_1.OK).json({ message: 'Se ha notificado al comprador el envio' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
    }));
});
exports.default = router;
