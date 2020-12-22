"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const ProductsSchema_1 = tslib_1.__importDefault(require("../database/ProductsSchema"));
const CategorySchema_1 = tslib_1.__importDefault(require("../database/CategorySchema"));
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const Store_1 = require("../entities/Store");
const mongoose_1 = require("mongoose");
const path_1 = tslib_1.__importDefault(require("path"));
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient({
    keyFilename: __dirname + '/../apivisiongoogle.json'
});
const empty = require('is-empty');
const router = express_1.Router();

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

router.post("/createstore",multer.single('banner'), (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var id = req.body.idcustomer;
    var storeverification = yield StoreSchema_1.default.findOne({ idcustomer: id }).select('idcustomer');
    if (!empty(storeverification)) {
        res.status(200).json({ serverMessage: "Ud ya tiene una tienda creada", result: storeverification });
        return;
    }
    let path = '';
    if (!empty(req.file)) {
        let date = new Date();
        let token = sha1_1.default(date.toString()).substr(0, 7);
        const blob=bucket.file(token+'_'+req.file.originalname);
        const blobStream=blob.createWriteStream({
            resumable:false
        });

        blobStream.on('error',(err)=>{
            res.json({message:err});
        });

        blobStream.on('finish',async()=>{
            console.log('se envio');
            
        });

        blobStream.end(req.file.buffer);
        body["realpathphoto"] = '';
        path = '/api/v1/store/get/banner/';
        body["banner"] = 'https://storage.googleapis.com/'+bucket.name+'/'+blob.name;
    }
    if (body == null) {
        res.status(http_status_codes_1.OK).json({ errorMessage: "El campo Body  está vacio" });
        return;
    }
    body["rating"] = 0;
    body["notify"] = {
        count: 0,
        buys: [],
        chats: []
    };
    var store = new StoreSchema_1.default(body);
    var result = yield store.save();
    res.status(http_status_codes_1.CREATED).json({ serverMessage: "Datos almacenados con éxito", result: result });
}));
router.get("/getstore", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.query;
    var limit = 10;
    var filter = {};
    if (params.limit != null) {
        limit = Number(params.limit);
    }
    if (params.id != null) {
        filter["id"] = params.id;
    }
    if (params.storename != null) {
        filter["storename"] = params.storename;
    }
    if (params.nit != null) {
        filter["nit"] = params.nit;
    }
    if (params.rating != null) {
        filter["rating"] = params.rating;
    }
    if (params.contains != null) {
        var keyconstrain = params.contains.toString();
        filter["storename"] = new RegExp(keyconstrain, "g");
    }
    var order = { _id: 1 };
    if (params.order != null) {
        order = {};
        var orderquery = params.order.toString();
        if (orderquery.match(/\-/g) != null) {
            var orderfilter = orderquery.replace(/\-/g, "");
            order[orderfilter] = -1;
        }
        else {
            order[orderquery] = 1;
        }
    }
    console.log(order);
    var result = yield StoreSchema_1.default.find(filter).sort(order);
    res.status(http_status_codes_1.OK).json(result);
}));
router.put("/update/storebanner", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "No se esta mandando ningun archivo" });
        return;
    }
    var params = req.query;
    if (params.id == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "El id es necesario" });
        return;
    }
    if (req.files.storefile == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario el archivo" });
        return;
    }
    var avatarfile = req.files.storefile;
    var date = new Date();
    var token = sha1_1.default(date.toString()).substr(0, 7);
    var nameAvatar = token + "_" + avatarfile.name.replace(/\s/g, "_");
    avatarfile.mv(__dirname + "/../bannerfiles/" + nameAvatar, function (err) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var path = "/api/v1/store/get/banner/" + params.id;
            var updateobj = {
                banner: path,
                realpathphoto: __dirname.replace(/services/g, "") + "bannerfiles/" + nameAvatar,
            };
            var result = yield StoreSchema_1.default.update({ _id: params.id }, updateobj);
            res.status(http_status_codes_1.OK).json({ serverMessage: "Datos almacenados con éxito", result });
        });
    });
});
router.put("/updatestore", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var query = req.query;
    if (query.id == null) {
        res.status(200).json({ errorMessage: "No existe el id." });
        return;
    }
    var data = req.body;
    if (data == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "El body esta vacio" });
        return;
    }
    let store = new Store_1.Store(data);
    let errors = store.validate();
    if (errors.length > 0) {
        res.status(200).json({ errorService: "Existen errores de validación", errors });
        return;
    }
    var updatedate = store.getAllDataDistincToNull();
    console.log(updatedate);
    var result = yield StoreSchema_1.default.update({ _id: query.id }, updatedate);
    res.status(http_status_codes_1.OK).json({ serverMessage: "Correcto", result });
}));
router.post("/product",multer.array('gallery',12),(req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    if (body == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "El campo Body  está vacio" });
        return;
    }
    body["pricesend"] = Number(body["pricesend"]);
    body["state"] = false;
    body["price"] = Number(body["price"]);
    body["discount"] = Number(body["discount"]);
    var idstore = body["id_store"];
    if (idstore == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario el atributo id_store" });
        return;
    }
    var storeone = yield StoreSchema_1.default.findOne({ _id: idstore });
    if (storeone == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "No existe ninguna tienda registrada con ese identificador" });
        return;
    }
    body["storeId"] = idstore;
    body["likes"] = parseInt(body["likes"]);
    body["quantityavaliable"] = parseInt(body["quantityavaliable"]);
    /*if (req.files == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Se requiere una imagen por defecto" });
        return;
    }
    var files = req.files;
    let pathdefaultimage = '';
    let getdefaultimage = '';
    if (empty(req.files)) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Error al enviar la imagen por defecto" });
        return;
    }
    var defaultimage = files.defaultimage;
    if (defaultimage) {
        var date = (Math.random() * 10).toString();
        var token = sha1_1.default(date.toString()).substr(0, 7);
        var nameAvatar = token + "_" + defaultimage.name.replace(/[\s-]/g, "_");
        yield defaultimage.mv(__dirname + '/../photoproduct/' + nameAvatar, (err) => {
            if (err) {
                console.log(err);
                return;
            }
        });
        pathdefaultimage = __dirname + '/../photoproduct/' + nameAvatar;
        getdefaultimage = '/api/v1/store/get/product/';
        body["pathDefaultimage"] = pathdefaultimage;
        body["defaultimage"] = getdefaultimage;
    }
    let objectGallery = [];
    if (empty(files.gallery)) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "No existe una imagen en la galería" });
        return;
    }
    var arrayGallery = files.gallery;
    if (Array.isArray(arrayGallery)) {
        for (let index = 0; index < arrayGallery.length; index++) {
            const element = arrayGallery[index];
            var date = (Math.random() * 10).toString();
            var token = sha1_1.default(date.toString()).substr(0, 7);
            var nameAvatar = token + "_" + element.name.replace(/[\s-]/g, "_");
            yield element.mv(__dirname + '/../photoproduct/' + nameAvatar, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
            objectGallery.push({
                realpath: __dirname + '/../photoproduct/' + nameAvatar,
                relativepath: '/api/v1/store/get/product/',
                description: req.body.photodescriptions[index],
                date: new Date(),
            });
        }
    }
    else {
        var date = (Math.random() * 10).toString();
        var token = sha1_1.default(date.toString()).substr(0, 7);
        var nameAvatar = token + "_" + arrayGallery.name.replace(/[\s-]/g, "_");
        yield arrayGallery.mv(__dirname + '/../photoproduct/' + nameAvatar, (err) => {
            if (err) {
                console.log(err);
                return;
            }
        });
        objectGallery.push({
            realpath: __dirname + '/../photoproduct/' + nameAvatar,
            relativepath: '/api/v1/store/get/product/' + nameAvatar,
            description: req.body.photodescriptions[0],
            date: new Date(),
        });
    }*/
    let objectGallery = [];
    for (let index = 0; index < req.files.length; index++) {
        const element = req.files[index];
        if(index==0){
            let date = new Date();
            let token = sha1_1.default(date.toString()).substr(0, 7);
            const blob=bucket.file(token+'_'+element.originalname);
            const blobStream=blob.createWriteStream({
                resumable:false
            });

            blobStream.on('error',(err)=>{
                res.json({message:err});
            });

            blobStream.on('finish',async()=>{
                console.log('se envio');
                
            });

            blobStream.end(element.buffer);
            body["pathDefaultimage"] = '';
            body["defaultimage"] = 'https://storage.googleapis.com/'+bucket.name+'/'+blob.name;
        }else{
            let date = new Date();
            let token = sha1_1.default(date.toString()).substr(0, 7);
            const blob=bucket.file(token+'_'+element.originalname);
            const blobStream=blob.createWriteStream({
                resumable:false
            });

            blobStream.on('error',(err)=>{
                res.json({message:err});
            });

            blobStream.on('finish',async()=>{
                console.log('se envio'); 
            });
            blobStream.end(element.buffer);
            objectGallery.push({
                realpath: '',
                relativepath: 'https://storage.googleapis.com/'+bucket.name+'/'+blob.name,
                description: 'description '+index,
                date: new Date(),
            });
        }
    }
    body["gallery"] = objectGallery;
    var paramsrequest = Object.keys(body);
    const ObjectId = mongoose_1.Types.ObjectId;
    body["category"] = [];
    body["sales"] = [];
    for (var i = 0; i < paramsrequest.length; i++) {
        if (paramsrequest[i].match(/^category\d+$/g)) {
            try {
                console.log(paramsrequest[i]);
                var idcategory = new ObjectId(body[paramsrequest[i]]);
                const categoryItem = yield CategorySchema_1.default.findOne({ _id: idcategory });
                if (categoryItem != null) {
                    body["category"].push(categoryItem);
                }
            }
            catch (error) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Un id correspondiente a las categorias es incorrecto ", error });
                return;
            }
        }
    }
    if (body["category"].length == 0) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario categorizar el producto" });
        return;
    }
    var product = new ProductsSchema_1.default(body);
    /*product.gallery.map((item) => {
        item.relativepath = item.relativepath + item._id;
        return item;
    });
    product.defaultimage += product._id;*/
    /*if (files == null) {
        res.status(200).json({ errorMessage: "Se requiere por lo menos una imagen en la variable 'defaultimage'" });
        return;
    }*/
    var resultinserted = yield product.save();
    var resultupdate = yield StoreSchema_1.default.update({ _id: idstore }, { $push: { products: product } });
    res.status(http_status_codes_1.OK).json({ resultinserted, resultupdate, message: 'Tu producto se ha insertado en la tienda' });
}));
router.put("/updateproduct", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var query = req.query;
    if (query.id == null) {
        res.status(200).json({ errorMessage: "No existe el id." });
        return;
    }
    var data = req.body;
    if (data == null) {
        res.status(200).json({ errorMessage: "El body esta vacio" });
        return;
    }
    var tags = [
        "pricesend",
        "price",
        "discount",
        "quantityavaliable",
        "productname",
        "description",
    ];
    var keys = Object.keys(data);
    var validkeys = keys.filter((values) => {
        return tags.indexOf(values) > -1;
    });
    var updateobject = {};
    for (var i = 0; i < validkeys.length; i++) {
        updateobject[validkeys[i]] = data[validkeys[i]];
    }
    var result = yield ProductsSchema_1.default.update({ _id: query.id }, updateobject);
    var newproductupdate = yield ProductsSchema_1.default.findOne({ _id: query.id });
    console.log(newproductupdate);
    if (newproductupdate != null) {
        var result = yield StoreSchema_1.default.updateOne({ "products._id": query.id }, { $set: { "products.$": newproductupdate } });
        res.status(200).json(result);
        return;
    }
    res.status(200).json({ errorMessage: "Error al actualizar los datos porfavor revisa " + query.id + " En Store Collection" });
}));
function movefile(file, path) {
    return new Promise((resolve, rejects) => {
        file.mv(path, (err) => {
            if (err) {
                resolve({ status: false, err });
                return;
            }
            resolve({ status: true });
        });
    });
}
function resize(path1, path2) {
    return new Promise((resolve, rejects) => {
        let inStream = fs_1.default.createReadStream(path1);
        let outStream = fs_1.default.createWriteStream(path2, { flags: "w" });
        outStream.on("error", function () {
            console.log("Error");
            resolve({ done: false });
        });
        outStream.on("close", function () {
            console.log("Successfully saved file");
            resolve({ done: true });
        });
        let transform = sharp_1.default()
            .resize({ width: 300 })
            .on("info", function (fileInfo) { });
        inStream.pipe(transform).pipe(outStream);
    });
}
router.put("/image/photoproduct", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "No hay archivos para ser subidos" });
        return;
    }
    var params = req.query;
    if (params.id == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "El id Es necesario" });
        return;
    }
    if (req.files.storefile == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario el archivo con el nomnbre {storefile}" });
        return;
    }
    if (req.body.description == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesaria una descripción {description}" });
        return;
    }
    if (req.body.description.match(/\{\}/g) != null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Existen caracteres no validos ne la peticion" });
        return;
    }
    var avatarfile = req.files.storefile;
    var date = new Date();
    var token = sha1_1.default(date.toString()).substr(0, 7);
    if (avatarfile == null) {
        res.status(300).json({
            errorMessage: "es necesario enviar el archivo con el parametro storefile",
        });
        return;
    }
    var nameAvatar = token + "_" + avatarfile.name.replace(/\s/g, "_");
    avatarfile.mv(__dirname + "/../photoproduct/" + nameAvatar, function (err) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var ObjectId = mongoose_1.Types.ObjectId;
            try {
                var idMongo = new ObjectId(params.id + "");
            }
            catch (error) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Identificador no válido", detail: error });
                return;
            }
            var path = "/api/v1/store/get/product/";
            var updateobj = {
                relativepath: path + idMongo,
                realpath: __dirname.replace(/services/g, "") + "photoproduct/" + nameAvatar
            };
            var elementdata = (yield ProductsSchema_1.default.find({ "gallery._id": idMongo })).
                map((element) => {
                element.gallery.map((elem) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (elem._id == idMongo.toHexString()) {
                        elem.relativepath = updateobj.relativepath;
                        elem.realpath = updateobj.realpath;
                        elem.description = req.body.description;
                    }
                    return elem;
                }));
                return element;
            });
            if (elementdata.length == 0) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Para poder actualizar una imagen de la base de datos es necesario pasarle el Identificador de una galeria" });
                return;
            }
            console.log(elementdata[0].id);
            var id = elementdata[0].id;
            delete elementdata[0].id;
            const result = yield ProductsSchema_1.default.update({ _id: id }, elementdata[0]);
            res.status(200).json({
                serverMessage: "Datos actualizados",
                elementdata,
                result: result
            });
        });
    });
}));
router.put("/add/photo/", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "No hay archivos para ser subidos" });
        return;
    }
    var params = req.query;
    if (params.id == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "El id Es necesario" });
        return;
    }
    if (req.files.storefile == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario el archivo con el nomnbre {storefile}" });
        return;
    }
    if (req.body.description == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesaria una descripción {description}" });
        return;
    }
    if (req.body.description.match(/\{\}/g) != null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Existen caracteres no validos ne la peticion" });
        return;
    }
    var avatarfile = req.files.storefile;
    var date = new Date();
    var token = sha1_1.default(date.toString()).substr(0, 7);
    if (avatarfile == null) {
        res.status(300).json({
            errorMessage: "es necesario enviar el archivo con el parametro storefile",
        });
        return;
    }
    var nameAvatar = token + "_" + avatarfile.name.replace(/\s/g, "_");
    avatarfile.mv(__dirname + "/../photoproduct/" + nameAvatar, function (err) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var ObjectId = mongoose_1.Types.ObjectId;
            try {
                var idMongo = new ObjectId(params.id + "");
            }
            catch (error) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Identificador no válido", detail: error });
                return;
            }
            var path = "/api/v1/store/get/product/";
            var updateobj = {
                relativepath: path + idMongo,
                realpath: __dirname.replace(/services/g, "") + "photoproduct/" + nameAvatar
            };
            var ObjectId = mongoose_1.Types.ObjectId;
            try {
                var idMongo = new ObjectId(params.id + "");
            }
            catch (error) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Identificador no válido", detail: error });
                return;
            }
            var product = yield ProductsSchema_1.default.findOne({ _id: idMongo });
            if (product == null) {
                res.status(http_status_codes_1.BAD_REQUEST).json({ errorService: "El servidor no existe" });
                return;
            }
            const okquery = yield ProductsSchema_1.default.update({ _id: idMongo }, {
                $push: {
                    gallery: {
                        realpath: updateobj.realpath,
                        relativepath: updateobj.relativepath,
                        description: req.body.description
                    }
                }
            });
            if (okquery) {
                var product = yield ProductsSchema_1.default.findOne({ _id: idMongo });
                res.status(http_status_codes_1.OK).json(product);
            }
            res.status(http_status_codes_1.OK).json({ errorService: "Error al actualizar los datos" });
        });
    });
}));
router.delete("/delete/photoproduct/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
}));
router.get("/get/banner/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.params;
    if (params == null) {
        res.status(300).json({ errorMessage: "Error parámetros invalidos" });
        return;
    }
    if (params.id == null) {
        res.status(300).json({
            errorMessage: "Error parámetros invalidos el id no se encontró",
        });
        return;
    }
    var results = yield StoreSchema_1.default.findOne({ _id: params.id }).select('realpathphoto');
    console.log(results);
    if (results != null) {
        res.sendFile(path_1.default.resolve(results.realpathphoto));
    }
    else {
        return;
    }
}));
router.get("/get/product/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.params;
    console.log(params);
    if (params == null) {
        res.status(300).json({ errorMessage: "Error parámetros invalidos" });
        return;
    }
    if (params.id == null) {
        res.status(300).json({
            errorMessage: "Error parámetros invalidos el id no se encontró",
        });
        return;
    }
    const ObjectId = mongoose_1.Types.ObjectId;
    try {
        const mongoIdProduct = new ObjectId(params.id);
        var result = yield ProductsSchema_1.default.find({ "gallery._id": mongoIdProduct });
        var resultdefault = yield ProductsSchema_1.default.findOne({ _id: mongoIdProduct }).select('pathDefaultimage');
        if (result.length == 1) {
            result[0].gallery.forEach((element) => {
                if (element._id == params.id) {
                    res.sendFile(path_1.default.resolve(element.realpath));
                    return;
                }
            });
            return;
        }
        else if (!empty(resultdefault)) {
            res.sendFile(path_1.default.resolve(resultdefault.pathDefaultimage));
        }
    }
    catch (error) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "El id no es válido" });
        return;
    }
}));
router.get("/get/productstore", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.query;
    console.log(params);
    if (params == null) {
        res.status(300).json({ errorMessage: "Error parámetros invalidos" });
        return;
    }
    if (params.id == null) {
        res.status(300).json({
            errorMessage: "Error parámetros invalidos el id no se encontró",
        });
        return;
    }
    let idstore = params.idstore;
    let idproduct = params.id;
    const doc = yield StoreSchema_1.default.findOne({ _id: idstore }).select('idcustomer products');
    let index = doc.products.findIndex((dat) => { return dat._id == idproduct; });
    let doc2 = doc.products[index];
    let response = {
        productname: doc2.productname,
        description: doc2.description,
        price: doc2.price,
        gallery: doc2.gallery,
        idcustomer: doc.idcustomer,
    };
    res.status(200).json(response);
}));
router.post('/chats', (req, res) => {
    let productid = req.body.productid;
    let storeid = req.body.storeid;
    let chatid = req.body.chatid;
    let userid = req.body.userid;
    console.log(req.body);
    StoreSchema_1.default.findOne({ _id: storeid }).select('products').exec((err, doc) => {
        let indexprod = doc.products.findIndex((dat) => { return dat._id == productid; });
        let indexchat = doc.products[indexprod].chat.findIndex((dat) => { return dat._id == chatid; });
        if (indexchat != -1) {
            res.status(200).json(doc.products[indexprod].chat[indexchat]);
        }
        else {
            let indexuserid = doc.products[indexprod].chat.findIndex((dat) => { return dat.clientid == userid; });
            if (indexuserid != -1) {
                res.status(200).json(doc.products[indexprod].chat[indexuserid]);
            }
            else {
                res.status(200).json([]);
            }
        }
    });
});
router.post('/getCustomerStore', (req, res) => {
    let id = req.body.storeid;
    let tokenfirebase = req.body.tokenfirebase;
    StoreSchema_1.default.findOne({ _id: id }).select('verify tokenFirebase').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            if (doc.verify) {
                let indextoken = doc.tokenFirebase.findIndex((dat) => { return dat == tokenfirebase; });
                if (indextoken == -1) {
                    doc.tokenFirebase.push(tokenfirebase);
                    yield StoreSchema_1.default.findByIdAndUpdate(doc._id, doc);
                }
                res.status(200).json({
                    message: 'La tienda esta verificada',
                    verify: true,
                    store: true,
                    storeid: doc._id
                });
            }
            else {
                res.status(200).json({
                    message: 'La tienda no esta verificada',
                    verify: false,
                    store: true,
                    storeid: ''
                });
            }
        }
        else {
            res.status(200).json({
                message: 'El usuario no tiene una tienda creada',
                verify: false,
                store: false,
                storeid: ''
            });
        }
    }));
});
router.post('/verifyStore',multer.single('credential'), (req, res) => {
    let id = req.body.userid;
    StoreSchema_1.default.findOne({ idcustomer: id }).select('verify storename nit city direction rubro hour phone verificationstore tokenFirebase').exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!empty(doc)) {
            doc.verify = true;
            doc.storename = req.body.name;
            doc.nit = req.body.nit;
            doc.city = req.body.city;
            doc.direction = req.body.direction;
            doc.rubro = req.body.rubro;
            doc.hour = req.body.hour;
            doc.phone = req.body.phone;
            doc.tokenFirebase=[req.body.tokenfirebase];

            let date = new Date();
            let token = sha1_1.default(date.toString()).substr(0, 7);

            const blob=yield bucket.file(token+'_'+req.file.originalname);
            const blobStream=yield blob.createWriteStream({
                resumable:false
            });

            yield blobStream.on('error',(err)=>{
                res.json({message:err});
            });

            yield blobStream.on('finish',async()=>{
                console.log('se envio');
                
            });

            yield blobStream.end(req.file.buffer);
            let path = 'https://storage.googleapis.com/'+bucket.name+'/'+blob.name;

            try {
                const [result] = yield client.textDetection(path);
                const detections = result.textAnnotations;
                doc.verificationstore = {
                    avaible: true,
                    datacard: {
                        directionpath:path,
                        card: path,
                        textcard: detections[0].description
                    }
                };
                StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                    res.status(200).json({
                        message: 'Se verificó la tienda',
                        storeid: doc._id
                    });
                });
            } catch (error) {
                res.status(200).json({
                    message: 'Debe de enviar una imagen correcta',
                    storeid: ''
                });
            }
            
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({
                message: err,
            });
        }
    }));
});
router.get("/myproducts/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    StoreSchema_1.default.findOne({ _id: id }).select('products').exec((err, doc) => {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json([]);
        }
        else {
            let arr = [];
            doc.products.forEach((element) => {
                arr.push({
                    defaultimage: element.defaultimage,
                    productname: element.productname,
                    description: element.description,
                    _id: element._id,
                    state: element.state,
                    likes: element.likes,
                    price: element.price,
                    quantityavailable: element.quantityavailable
                });
            });
            res.status(200).json(arr);
        }
    });
}));
router.get("/detailsproudct/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    StoreSchema_1.default.findOne({ 'products._id': id }).select('products._id products.productname products.description products.price products.likes products.quantityavailable products.pricesend products.state products.gallery')
        .exec((err, doc) => {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({});
        }
        else {
            let indexdetail = doc.products.findIndex((dat) => { return dat._id == id; });
            if (indexdetail != -1) {
                res.status(200).json(doc.products[indexdetail]);
            }
            else {
                res.status(http_status_codes_1.BAD_REQUEST).json({ err });
            }
        }
    });
}));
router.patch("/statechangeproduct/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    StoreSchema_1.default.findOne({ 'products._id': id }).select('products').exec((err, doc) => {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({});
        }
        else {
            let indexdetail = doc.products.findIndex((dat) => { return dat._id == id; });
            if (indexdetail != -1) {
                doc.products[indexdetail].state = !doc.products[indexdetail].state;
                let state = doc.products[indexdetail].state;
                StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                    res.status(200).json({ state });
                });
            }
            else {
                res.status(http_status_codes_1.BAD_REQUEST).json({ err });
            }
        }
    });
}));
router.get("/allstores", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(yield StoreSchema_1.default.find());
}));
exports.default = router;
