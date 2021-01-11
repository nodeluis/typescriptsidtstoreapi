"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const ProductsSchema_1 = tslib_1.__importDefault(require("../database/ProductsSchema"));
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const empty = require('is-empty');
const router = express_1.Router();
router.post('/storesAndroid', (req, res) => {
    let userid = req.body.userid;
    if (userid == '') {
        StoreSchema_1.default.find().select('_id stars storename sales verificationstore banner').exec((err, docs) => {
            if (!empty(docs)) {
                let arr = [];
                docs.forEach((doc) => {
                    let sumstar = 0;
                    doc.stars.forEach((element) => {
                        sumstar += element.star;
                    });
                    let objectResponse = {
                        _id: doc._id,
                        stars: (doc.stars.length == 0 ? 5 : sumstar / doc.stars.length),
                        like: false,
                        storename: doc.storename,
                        sales: doc.sales.length,
                        banner: doc.banner,
                        verification: (empty(doc.verificationstore) ? false : true)
                    };
                    arr.push(objectResponse);
                });
                res.status(200).json(arr);
            }
            else {
                res.status(200).json([]);
            }
        });
    }
    else {
        StoreSchema_1.default.find().select('_id stars storename sales verificationstore banner').exec((err, docs) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            if (!empty(docs)) {
                let arr = [];
                let user = yield CustomerSchema_1.default.findOne({ _id: userid }).select('likestore');
                docs.forEach((doc) => {
                    let sumstar = 0;
                    doc.stars.forEach((element) => {
                        sumstar += element.star;
                    });
                    let indexlike = user.likestore.findIndex((dat) => { return dat.storeid + '' == doc._id; });
                    let objectResponse = {
                        _id: doc._id,
                        stars: (doc.stars.length == 0 ? 5 : sumstar / doc.stars.length),
                        like: (indexlike == -1 ? false : true),
                        storename: doc.storename,
                        sales: doc.sales.length,
                        banner: doc.banner,
                        verification: (empty(doc.verificationstore) ? false : true)
                    };
                    arr.push(objectResponse);
                });
                res.status(200).json(arr);
            }
            else {
                res.status(200).json([]);
            }
        }));
    }
});
router.post('/recomendationsStoresAndroid', (req, res) => {
    let userid = req.body.userid;
    if (userid == '') {
        StoreSchema_1.default.find().select('_id stars storename sales verificationstore banner').exec((err, docs) => {
            if (!empty(docs)) {
                let arr = [];
                docs.forEach((doc) => {
                    let sumstar = 0;
                    doc.stars.forEach((element) => {
                        sumstar += element.star;
                    });
                    let objectResponse = {
                        _id: doc._id,
                        stars: (doc.stars.length == 0 ? 5 : sumstar / doc.stars.length),
                        like: false,
                        storename: doc.storename,
                        sales: doc.sales.length,
                        banner: doc.banner,
                        verification: (empty(doc.verificationstore) ? false : true)
                    };
                    arr.push(objectResponse);
                });
                res.status(200).json(arr);
            }
            else {
                res.status(200).json([]);
            }
        });
    }
    else {
        StoreSchema_1.default.find().select('_id stars storename sales verificationstore banner').exec((err, docs) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            if (!empty(docs)) {
                let arr = [];
                let user = yield CustomerSchema_1.default.findOne({ _id: userid }).select('likestore');
                docs.forEach((doc) => {
                    let sumstar = 0;
                    doc.stars.forEach((element) => {
                        sumstar += element.star;
                    });
                    let indexlike = user.likestore.findIndex((dat) => { return dat.storeid + '' == doc._id; });
                    let objectResponse = {
                        _id: doc._id,
                        stars: (doc.stars.length == 0 ? 5 : sumstar / doc.stars.length),
                        like: (indexlike == -1 ? false : true),
                        storename: doc.storename,
                        sales: doc.sales.length,
                        banner: doc.banner,
                        verification: (empty(doc.verificationstore) ? false : true)
                    };
                    arr.push(objectResponse);
                });
                res.status(200).json(arr);
            }
            else {
                res.status(200).json([]);
            }
        }));
    }
});
router.get('/productsAndroid', (req, res) => {
    ProductsSchema_1.default.find().select('likes productname price state smalldescription ofert storeId sales defaultimage').exec((err, docs) => {
        if (empty(docs)) {
            res.status(200).json([]);
        }
        else {
            let arr = [];
            docs.forEach((doc) => {
                arr.push({
                    _id: doc._id,
                    stars: (doc.likes == 0 ? 5 : doc.likes),
                    ofert: doc.ofert.avaible,
                    sales: doc.sales.length,
                    productname: doc.productname,
                    price: doc.price,
                    smalldescription: doc.smalldescription,
                    defaultimage: doc.defaultimage,
                    storeid: doc.storeId
                });
            });
            res.status(200).json(arr);
        }
    });
});
router.post('/detailsProductAndroid', (req, res) => {
    let productid = req.body.productid;
    let userid = req.body.userid;
    StoreSchema_1.default.findOne({ 'products._id': productid }).select('products._id products.productname products.description products.price products.likes products.quantityavailable products.pricesend products.state products.gallery idcustomer products.comments banner storename')
        .exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
        else {
            let indexdetail = doc.products.findIndex((dat) => { return dat._id + '' == productid; });
            let objectResponse;
            if (userid == '') {
                objectResponse = {
                    _id: '',
                    storeid: '',
                    msn: false,
                    cart: true,
                    productname: doc.products[indexdetail].productname,
                    likes: doc.products[indexdetail].likes,
                    description: doc.products[indexdetail].description,
                    price: doc.products[indexdetail].price,
                    comments: doc.products[indexdetail].comments,
                    storebanner: doc.banner,
                    storename: doc.storename,
                    gallery: doc.products[indexdetail].gallery,
                    stateAccount: {
                        stateacc: false,
                        sesion: false,
                        message: 'Ud. no esta logeado'
                    }
                };
            }
            else {
                let user = yield CustomerSchema_1.default.findOne({ _id: userid }).select('shoppingcart verificationUser');
                let indexprodcart = user.shoppingcart.findIndex((dat) => { return dat.product + '' == productid; });
                let message = '';
                let stateaccount = false;
                if (!empty(user.verificationUser)) {
                    if (user.verificationUser.dataIdentificationCard.avaible && user.verificationUser.dataProfile.avaible) {
                        if (user.verificationUser.fingerPrint.avaible || user.verificationUser.codeDigit.avaible) {
                            stateaccount = true;
                        }
                        else {
                            message = 'Complete la verificación de su usuario por favor';
                        }
                    }
                    else {
                        message = 'Tu usuario no esta verificado dirijase a su perfil';
                    }
                }
                else {
                    message = 'Tu usuario no esta verificado';
                }
                objectResponse = {
                    _id: doc.products[indexdetail]._id,
                    storeid: doc._id,
                    msn: (doc.idcustomer == userid ? false : stateaccount ? true : false),
                    cart: (indexprodcart != -1 ? false : true),
                    productname: doc.products[indexdetail].productname,
                    likes: doc.products[indexdetail].likes,
                    description: doc.products[indexdetail].description,
                    price: doc.products[indexdetail].price,
                    comments: doc.products[indexdetail].comments,
                    storebanner: doc.banner,
                    storename: doc.storename,
                    gallery: doc.products[indexdetail].gallery,
                    stateAccount: {
                        stateacc: stateaccount,
                        sesion: true,
                        message
                    },
                    messagecart: (indexprodcart == -1 ? '' : 'Este producto ya se encuentra en tu carrito')
                };
            }
            console.log(objectResponse);
            res.status(http_status_codes_1.OK).json(objectResponse);
        }
    }));
});
router.get('/similaryProductsAndroid', (req, res) => {
    ProductsSchema_1.default.find().select('likes productname price state smalldescription ofert sales defaultimage storeId').exec((err, docs) => {
        if (empty(docs)) {
            res.status(200).json([]);
        }
        else {
            let arr = [];
            docs.forEach((doc) => {
                arr.push({
                    _id: doc._id,
                    stars: (doc.likes == 0 ? 5 : doc.likes),
                    ofert: doc.ofert.avaible,
                    sales: doc.sales.length,
                    productname: doc.productname,
                    price: doc.price,
                    smalldescription: doc.smalldescription,
                    defaultimage: doc.defaultimage,
                    storeid: doc.storeId
                });
            });
            res.status(200).json(arr);
        }
    });
});
router.post('/detailsStoreAndroid', (req, res) => {
    let storeid = req.body.storeid;
    let userid = req.body.userid;
    StoreSchema_1.default.findOne({ _id: storeid }).select('_id stars storename sales verificationstore description').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
        else {
            let objectResponse;
            if (userid == '') {
                let sumstar = 0;
                doc.stars.forEach((element) => {
                    sumstar += element.star;
                });
                objectResponse = {
                    stars: (doc.stars.length == 0 ? 5 : sumstar / doc.stars.length),
                    sales: doc.sales.length,
                    storename: doc.storename,
                    verify: (empty(doc.verificationstore) ? false : true),
                    description: doc.description,
                    like: false,
                    likevision: false
                };
            }
            else {
                let sumstar = 0;
                doc.stars.forEach((element) => {
                    sumstar += element.star;
                });
                let user = yield CustomerSchema_1.default.findOne({ _id: userid }).select('likestore');
                let indexlike = user.likestore.findIndex((dat) => { return dat.storeid == storeid; });
                objectResponse = {
                    stars: (doc.stars.length == 0 ? 5 : sumstar / doc.stars.length),
                    sales: doc.sales.length,
                    storename: doc.storename,
                    verify: (empty(doc.verificationstore) ? false : true),
                    description: doc.description,
                    like: (indexlike == -1 ? false : true),
                    likevision: true
                };
            }
            res.status(http_status_codes_1.OK).json(objectResponse);
        }
    }));
});
router.get('/storeProductsAndroid/:id', (req, res) => {
    let storeid = req.params.id;
    ProductsSchema_1.default.find({ storeId: storeid }).select('likes productname defaultimage storeId price state smalldescription ofert sales').exec((err, docs) => {
        if (empty(docs)) {
            res.status(200).json([]);
        }
        else {
            let arr = [];
            docs.forEach((doc) => {
                arr.push({
                    _id: doc._id,
                    stars: (doc.likes == 0 ? 5 : doc.likes),
                    ofert: doc.ofert.avaible,
                    sales: doc.sales.length,
                    productname: doc.productname,
                    price: doc.price,
                    smalldescription: doc.smalldescription,
                    defaultimage: doc.defaultimage,
                    storeid: doc.storeId
                });
            });
            res.status(200).json(arr);
        }
    });
});
router.get('/userSalesProductsAndroid', (req, res) => {
    ProductsSchema_1.default.find().select('likes productname price state smalldescription storeId ofert sales defaultimage').exec((err, docs) => {
        if (empty(docs)) {
            res.status(200).json([]);
        }
        else {
            let arr = [];
            docs.forEach((doc) => {
                arr.push({
                    _id: doc._id,
                    stars: (doc.likes == 0 ? 5 : doc.likes),
                    ofert: doc.ofert.avaible,
                    sales: doc.sales.length,
                    productname: doc.productname,
                    price: doc.price,
                    smalldescription: doc.smalldescription,
                    defaultimage: doc.defaultimage,
                    storeid: doc.storeId
                });
            });
            res.status(200).json(arr);
        }
    });
});
router.post('/postFollowStore', (req, res) => {
    let storeid = req.body.storeid;
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('likestore').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
        else {
            let index = doc.likestore.findIndex((dat) => { return dat.storeid == storeid; });
            if (index == -1) {
                doc.likestore.push({
                    storeid
                });
            }
            else {
                doc.likestore.splice(index, 1);
            }
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({
                    message: (index == -1 ? 'Ahora estas siguiendo a la tienda' : 'Dejaste de seguir a la tienda'),
                    statelike: (index == -1 ? true : false)
                });
            });
        }
    }));
});
router.get('/userProfileAndroid/:id', (req, res) => {
    let userid = req.params.id;
    CustomerSchema_1.default.findOne({ _id: userid }).select('xpressdata googledata facebookdata likestore history shoppingcart verificationUser').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
        else {
            let message = '';
            let stateaccount = false;
            if (!empty(doc.verificationUser)) {
                if (doc.verificationUser.dataIdentificationCard.avaible && doc.verificationUser.dataProfile.avaible) {
                    if (doc.verificationUser.fingerPrint.avaible || doc.verificationUser.codeDigit.avaible) {
                        stateaccount = true;
                    }
                    else {
                        message = 'Complete la verificación de su usuario por favor';
                    }
                }
                else {
                    message = 'Para realizar compras debes de verificar tu usuario';
                }
            }
            else {
                message = 'Para realizar compras debes de verificar tu usuario';
            }
            let objectResponse;
            if (doc.xpressdata.avaible) {
                objectResponse = {
                    name: doc.xpressdata.firstname + ' ' + doc.xpressdata.lastname,
                    email: doc.xpressdata.email,
                    profilephoto: doc.xpressdata.profilePhoto,
                    likestore: doc.likestore.length,
                    history: doc.history.length,
                    shoppingcart: doc.shoppingcart.length,
                    stateaccount,
                    message
                };
            }
            else if (doc.googledata.avaible) {
                objectResponse = {
                    name: doc.googledata.firstname,
                    email: doc.googledata.email,
                    profilephoto: doc.googledata.picture,
                    likestore: doc.likestore.length,
                    history: doc.history.length,
                    shoppingcart: doc.shoppingcart.length,
                    stateaccount,
                    message
                };
            }
            else if (doc.facebookdata.avaible) {
                objectResponse = {
                    name: doc.facebookdata.firstname,
                    email: '',
                    profilephoto: doc.facebookdata.picture,
                    likestore: doc.likestore.length,
                    history: doc.history.length,
                    shoppingcart: doc.shoppingcart.length,
                    stateaccount,
                    message
                };
            }
            res.status(200).json(objectResponse);
        }
    }));
});
exports.default = router;
