"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const CustomerSchema_1 = tslib_1.__importDefault(require("../database/CustomerSchema"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const Customer_1 = require("../entities/Customer");
const StoreSchema_1 = tslib_1.__importDefault(require("../database/StoreSchema"));
const nodemailer_1 = tslib_1.__importDefault(require("nodemailer"));
const empty = require('is-empty');
const router = express_1.Router();
router.post("/join/singup", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const softCustomer = req.body;
    softCustomer["seller"] = false;
    softCustomer["points"] = 0;
    softCustomer["realpathphoto"] = "";
    softCustomer["password"] = sha1_1.default(softCustomer["password"]);
    softCustomer["profilePhoto"] = "";
    softCustomer["realpathPhoto"] = "";
    softCustomer["history"] = [];
    const newCustomer = new CustomerSchema_1.default(softCustomer);
    const softCustomeremail = yield CustomerSchema_1.default.find({ email: softCustomer.email });
    if (softCustomeremail.length > 0) {
        res.status(300).json({ errorMessage: "El Email ya esta registrado" });
        return;
    }
    newCustomer.save((err, docs) => {
        if (err) {
            res.status(300).json({ errorMessage: "Existe un problema con la base de datos", err });
            return;
        }
        res.status(200).json({ serverMessage: "Usuario Guardado satisfactoriamente", newCustomer: docs });
        return;
    });
}));
router.post("/token/get", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.body;
    if (params.email == null) {
        res.status(300).json({ message: "Es necesario el Email" });
        return;
    }
    if (params.password == null) {
        res.status(300).json({ message: "Es necesario el password" });
        return;
    }
    var signparams = { 'xpressdata.email': params.email, 'xpressdata.password': sha1_1.default(params.password) };
    let userLoginCorrect = yield CustomerSchema_1.default.findOne(signparams);
    console.log(userLoginCorrect);
    if (!empty(userLoginCorrect)) {
        const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
        const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: params.email }, privatekey, { algorithm: "RS256" });
        res.status(200).json({ message: "Credenciales correctas", _id: userLoginCorrect._id, token, name: userLoginCorrect.xpressdata.firstname, url: userLoginCorrect.xpressdata.profilePhoto });
        let tokenfirebase = params.tokenfirebase;
        let indextoken = userLoginCorrect.tokenFirebase.findIndex((token) => { return token == tokenfirebase; });
        if (indextoken == -1) {
            userLoginCorrect.tokenFirebase.push(tokenfirebase);
            yield CustomerSchema_1.default.findByIdAndUpdate(userLoginCorrect._id, userLoginCorrect);
        }
        return;
    }
    else {
        res.status(http_status_codes_1.BAD_REQUEST).json({ message: "Credenciales erroneas" });
    }
}));
router.post("/tokenstore/get", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.body;
    if (params.email == null) {
        res.status(200).json({ message: "Es necesario el Email", st: false });
        return;
    }
    if (params.password == null) {
        res.status(200).json({ message: "Es necesario el password", st: false });
        return;
    }
    var signparams = { 'xpressdata.email': params.email, 'xpressdata.password': sha1_1.default(params.password) };
    let userLoginCorrect = yield CustomerSchema_1.default.findOne(signparams);
    if (!empty(userLoginCorrect)) {
        const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
        const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: params.email }, privatekey, { algorithm: "RS256" });
        res.status(200).json({ message: "Credenciales correctas", _id: userLoginCorrect._id, token, name: userLoginCorrect.xpressdata.firstname, url: userLoginCorrect.xpressdata.profilePhoto, st: true });
        return;
    }
    else {
        res.status(200).json({ message: "Credenciales erroneas", st: false });
        return;
    }
}));
router.put("/logout/tokenfirebase", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let userid = req.body.userid;
    let tokenfirebase = req.body.tokenfirebase;
    CustomerSchema_1.default.findOne({ _id: userid }).select('tokenFirebase').exec((err, doc) => {
        if (!empty(doc)) {
            let indextoken = doc.tokenFirebase.findIndex((token) => { return token == tokenfirebase; });
            if (indextoken == -1) {
                res.status(http_status_codes_1.OK).json({ message: 'Su sesión acabó, Para recibir notificaciones de forma correcta vuelva a iniciar sesión' });
            }
            else {
                res.status(http_status_codes_1.OK).json({ message: 'Su sesión acabó' });
                doc.tokenFirebase.splice(indextoken, 1);
                CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => { console.log('token borrado'); });
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Error en la consulta', err });
        }
    });
}));
router.put("/logoutstore/tokenfirebase", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let storeid = req.body.storeid;
    let tokenfirebase = req.body.tokenfirebase;
    StoreSchema_1.default.findOne({ _id: storeid }).select('tokenFirebase').exec((err, doc) => {
        if (!empty(doc)) {
            let indextoken = doc.tokenFirebase.findIndex((token) => { return token == tokenfirebase; });
            if (indextoken == -1) {
                res.status(http_status_codes_1.OK).json({ message: 'Su sesión acabó, Para recibir notificaciones de forma correcta vuelva a iniciar sesión' });
            }
            else {
                res.status(http_status_codes_1.OK).json({ message: 'Su sesión acabó' });
                doc.tokenFirebase.splice(indextoken, 1);
                StoreSchema_1.default.findByIdAndUpdate(doc._id, doc, () => { console.log('token borrado'); });
            }
        }
        else {
            res.status(http_status_codes_1.OK).json({ message: 'Su sesión acabó', err });
        }
    });
}));
router.put("/update/user", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.query;
    if (params.id == null) {
        res.status(300).json({ ModelErrorMessage: "Es necesario el identificador" });
        return;
    }
    const customer = new Customer_1.Customer(req.body);
    if (req.body.firstname) {
        customer.firstname = req.body.firstname;
    }
    if (req.body.lastname) {
        customer.lastname = req.body.lastname;
    }
    if (req.body.password) {
        customer.password = req.body.password;
    }
    if (req.body.phone) {
        customer.phone = req.body.phone;
    }
    if (req.body.profilephoto) {
        customer.profilePhoto = req.body.profilephoto;
    }
    let errors = customer.validate();
    if (errors.length == 0) {
        customer.password = sha1_1.default(customer.password);
        let dataupdate = customer.getAllDataDistincToNull();
        let updateUser = yield CustomerSchema_1.default.update({ _id: params.id }, dataupdate);
        res.status(200).json({ serverMessage: "Correcto", updateUser });
        return;
    }
    res.status(300).json({ errorMessage: "Error en el servidor", errors });
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

router.put("/update/profileavatar",multer.single('avatarfile'),async(req, res) => {
    if (empty(req.file)) {
        res.status(400).json({ message: 'No existen archivos para subir' });
        return;
    }
    var params = req.query;
    if (params.id == null) {
        res.status(300).json({ message: "El identificador Es necesario" });
        return;
    }

    var date = new Date();
    var token = sha1_1.default(date.toString()).substr(0, 7);

    const user=await CustomerSchema_1.default.findOne({ _id: params.id }).select('xpressdata googledata facebookdata');

    if(!user.xpressdata.avaible){
        if(user.googledata.avaible){
            res.status(200).json({ message: "Si desea cambiar su avatar, debe de hacerlo en su cuenta de correo", url: user.googledata.picture });
        }else{
            res.status(200).json({ message: "Si desea cambiar su avatar, debe de hacerlo en su cuenta de facebook", url: user.facebookdata.picture });
        }
        return;
    }

    const blob=bucket.file(token+'_'+req.file.originalname);
    const blobStream=blob.createWriteStream({
        resumable:false
    });

    blobStream.on('error',(err)=>{
        res.json({message:err});
    });

    blobStream.on('finish',async()=>{
        var path = 'https://storage.googleapis.com/'+bucket.name+'/'+blob.name;
        user.xpressdata.profilePhoto=path;
        user.xpressdata.realpathPhoto='';
        var result = await CustomerSchema_1.default.update({ _id: params.id }, user);
        res.status(200).json({ message: "Avatar actualizado", url: path });
        
    });

    blobStream.end(req.file.buffer);
});
router.get("/get/avatar/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.params;
    if (params.id == null) {
        res.status(200).json({ errorMessage: "El identificador es necesario" });
        return;
    }
    var senddata = yield CustomerSchema_1.default.findOne({ _id: params.id }).select("realpathPhoto");
    if (senddata != null) {
        res.sendFile(senddata.realpathPhoto.toString());
        return;
    }
    res.status(200).json({ errorMessage: "Error no existe la imagen" });
}));
router.post("/forgot/password", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var data = req.body;
    if (data.email == null) {
        res.status(200).json({ errorMessage: "No se encontro ningún parámetro email" });
        return;
    }
    var customer = new Customer_1.Customer(data);
    var errors = customer.validate();
    if (errors.length > 0) {
        res.status(300).json({ errorMessage: "Error en el servidor", errors });
        return;
    }
    var code = sha1_1.default((new Date()).toString()).substr(0, 5);
    var forgot = {
        codegen: code,
        state: false,
        date: new Date()
    };
    var account = yield CustomerSchema_1.default.findOne({ email: data.email });
    if (account == null) {
        res.status(200).json({ errorMessage: "el correo " + data.email + " no es parte de nuestros registros" });
        return;
    }
    var result = yield CustomerSchema_1.default.update({ email: data.email }, { $push: { forgot_account: forgot } });
    console.log(result);
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'alisa68@ethereal.email',
            pass: 'y3GgDCGsUy8PgTqGK6'
        }
    });
    let info = yield transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>',
        to: data.email,
        subject: "Tu codigo es  ✔",
        text: "Codigo",
        html: "Codigo " + "<b>" + code + "</b>",
    });
    if (info) {
        res.status(200).json({ serverMessage: "Acabamos de enviar un email que contiene un código que te permitira recuperar tu cuenta" });
        return;
    }
    res.status(200).json({ errorMessage: "Woops surgio un error inesperado" });
    return;
}));
router.post("/set/address/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.params;
    if (params.id == null) {
        res.status(200).json({ errorMessage: "Error: es necesario el id del usuario" });
        return;
    }
    var data = req.body;
    if (data["default"] == "true") {
        data["default"] = true;
    }
    else if (data["default"] == "false") {
        data["default"] = false;
    }
    data["lat"] = Number(data["lat"]);
    data["lng"] = Number(data["lng"]);
    var sendaddress = new Customer_1.SendAddress(data);
    var errors = sendaddress.validate();
    if (errors.length > 0) {
        res.status(200).json({ errorMessage: errors });
        return;
    }
    var result = yield CustomerSchema_1.default.update({ _id: params.id }, { $push: { sendAddress: sendaddress } });
    res.status(200).json(result);
}));
router.get('/get/address/:id', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.params;
    if (params.id == null) {
        res.status(300).json({ errorMessage: "El identificador es necesario" });
        return;
    }
    var customerdata = yield CustomerSchema_1.default.find({ _id: params.id }).select("sendAddress");
    res.status(200).json(customerdata);
}));
router.get("/get/list", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var limit = 10;
    var skip = 0;
    if (req.query.limit != null) {
        limit = parseInt(req.query.limit.toString());
    }
    if (req.query.skip != null) {
        skip = parseInt(req.query.skip.toString());
    }
    const list = yield CustomerSchema_1.default.find({}).skip(skip).limit(limit);
    res.status(http_status_codes_1.OK).json(list);
}));
router.post("/setstore", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (req.query.idUser == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario un id de usuario" });
        return;
    }
    if (req.query.idStore == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario un id de tienda" });
        return;
    }
    var store = yield StoreSchema_1.default.findOne({ _id: req.query.idStore });
    if (store != null) {
        const result = yield CustomerSchema_1.default.update({ _id: req.query.idUser }, { $push: { idstore: req.query.idStore.toString() } });
        res.status(http_status_codes_1.BAD_REQUEST).json(result);
        return;
    }
    res.status(http_status_codes_1.OK).json({ errorMessage: "El id propocionado es de una tienda incorrecta o simplemente esta no existe" });
}));
router.post("/removestore", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (req.query.idUser == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario un id de usuario" });
        return;
    }
    if (req.query.idStore == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario un id de tienda" });
        return;
    }
    const user = yield CustomerSchema_1.default.find({ _id: req.query.idUser });
    user.forEach((item, i) => {
    });
}));
router.get("/allcustomers", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(yield CustomerSchema_1.default.find());
}));
router.put("/updatetokenfirebase/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let body = req.body;
    if (body == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Error en el envio" });
    }
    CustomerSchema_1.default.findOne({ _id: req.params.id }).select('tokenFirebase').exec((err, doc) => {
        if (err) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Error al momento de actualizar" });
        }
        let token = body.token;
        doc.tokenFirebase = token;
        CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
            res.status(200).json({ serverMessage: 'Token de firebase se ha actualizado' });
        });
    });
}));
router.get('/nodemailertest', (req, res) => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'ca9.toservers.com',
        port: 465,
        auth: {
            user: 'soporte@innovatek.com.bo',
            pass: 'soporte123'
        }
    });
    let mailOptions = {
        from: 'soporte@innovatek.com.bo',
        to: 'adonis.melchor@gmail.com',
        subject: 'test port',
        text: 'mesaje con una cuenta de innovatek (ya esta dando)'
    };
    transporter.sendMail(mailOptions, (err, data) => {
        if (empty(data)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ serverMessage: '' + err });
        }
        else {
            res.status(200).json({ serverMessage: data });
        }
    });
});
router.put('/passForgotEmail', (req, res) => {
    let email = req.body.email;
    CustomerSchema_1.default.findOne({ 'xpressdata.email': email }).select('codePassForgot').exec((err, doc) => {
        if (!empty(doc)) {
            const transporter = nodemailer_1.default.createTransport({
                host: 'ca9.toservers.com',
                port: 465,
                auth: {
                    user: 'soporte@innovatek.com.bo',
                    pass: 'soporte123'
                }
            });
            let code = Math.floor(1000 + Math.random() * 9000);
            let mailOptions = {
                from: 'soporte@innovatek.com.bo',
                to: email,
                subject: 'Codigo de recuperación',
                text: code + ''
            };
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    res.status(http_status_codes_1.BAD_REQUEST).json({
                        redir: false,
                        message: 'Error en la petición',
                        err
                    });
                }
                doc.codePassForgot = code;
                CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                    res.status(200).json({ redir: true, message: 'Se envio un código a su correo' });
                });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ redir: false, message: 'El email no existe' });
        }
    });
});
router.post('/passForgotCode', (req, res) => {
    let email = req.body.email;
    let code = parseInt(req.body.code);
    CustomerSchema_1.default.findOne({ 'xpressdata.email': email }).select('codePassForgot').exec((err, doc) => {
        if (!empty(doc)) {
            if (code == doc.codePassForgot) {
                res.status(200).json({ redir: true, message: 'Ya puede editar' });
            }
            else {
                res.status(http_status_codes_1.BAD_REQUEST).json({ redir: false, message: 'El código es incorrecto' });
            }
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ redir: false, message: 'Error en la petición' });
        }
    });
});
router.put('/newPass', (req, res) => {
    let email = req.body.email;
    let pass = req.body.pass;
    CustomerSchema_1.default.findOne({ 'xpressdata.email': email }).select('xpressdata').exec((err, doc) => {
        if (!empty(doc)) {
            doc.xpressdata.password = sha1_1.default(pass);
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ redir: true, message: '!!Se ha cambiado su contraseña!!' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ redir: false, message: 'Error en la petición' });
        }
    });
});
router.post("/registerLoginXpress", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let password = sha1_1.default(req.body.password);
    let phone = req.body.phone;
    let country = req.body.country;
    let state = req.body.state;
    const softCustomeremail = yield CustomerSchema_1.default.findOne({ 'xpressdata.email': email });
    if (!empty(softCustomeremail)) {
        res.status(300).json({
            message: "El Email ya esta registrado"
        });
        return;
    }
    const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
    const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: email }, privatekey, { algorithm: "RS256" });
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
            country,
            state,
        },
        facebookdata: { avaible: false },
        googledata: { avaible: false },
        seller: false,
        points: 0,
        codePassForgot: -1,
        date: new Date(),
        history: []
    });
    softCustomer.save((err, docs) => {
        if (err) {
            res.status(300).json({ message: "Existe un problema con la base de datos", err });
            return;
        }
        res.status(200).json({ message: "Usuario Guardado satisfactoriamente", _id: softCustomer._id, token, name: firstname, url: '' });
        return;
    });
}));
router.post("/registerLoginXpressAndroid", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let password = sha1_1.default(req.body.password);
    let phone = req.body.phone;
    let country = req.body.country;
    let state = req.body.state;
    let tokenfirebase = req.body.tokenfirebase;
    const softCustomeremail = yield CustomerSchema_1.default.findOne({ 'xpressdata.email': email });
    if (!empty(softCustomeremail)) {
        res.status(300).json({
            message: "El Email ya esta registrado"
        });
        return;
    }
    const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
    const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: email }, privatekey, { algorithm: "RS256" });
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
            country,
            state,
        },
        facebookdata: { avaible: false },
        googledata: { avaible: false },
        seller: false,
        points: 0,
        tokenFirebase: [tokenfirebase],
        codePassForgot: -1,
        date: new Date(),
        history: []
    });
    softCustomer.save((err, docs) => {
        if (err) {
            res.status(300).json({ message: "Existe un problema con la base de datos", err });
            return;
        }
        res.status(200).json({ message: "Usuario Guardado satisfactoriamente", _id: softCustomer._id, token, name: firstname, url: '' });
        return;
    });
}));
router.post("/registerLoginGoogleAndroid", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let password = sha1_1.default(req.body.password);
    let picture = req.body.picture;
    let googleid = req.body.googleid;
    let tokenfirebase = req.body.tokenfirebase;
    const softCustomeremail = yield CustomerSchema_1.default.findOne({ 'googledata.email': email });
    const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
    const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: email }, privatekey, { algorithm: "RS256" });
    if (!empty(softCustomeremail)) {
        softCustomeremail.googledata.picture = picture;
        softCustomeremail.tokenFirebase.push(tokenfirebase);
        CustomerSchema_1.default.findByIdAndUpdate(softCustomeremail._id, softCustomeremail, () => {
            res.status(200).json({ message: "Bienvenido", _id: softCustomeremail._id, token, name: firstname, url: picture });
            return;
        });
    }
    else {
        const softCustomer = new CustomerSchema_1.default({
            xpressdata: { avaible: false },
            facebookdata: { avaible: false },
            googledata: {
                avaible: true,
                firstname,
                lastname,
                password,
                email,
                picture,
                googleid,
                profilePhoto: '',
                realpathPhoto: '',
                phone: '',
                country: '',
                state: ''
            },
            tokenFirebase: [tokenfirebase],
            seller: false,
            points: 0,
            date: new Date(),
            history: []
        });
        softCustomer.save((err, docs) => {
            if (err) {
                console.log(err);
                res.status(300).json({ message: "Existe un problema con la base de datos", err });
                return;
            }
            res.status(200).json({ message: "Usuario Guardado satisfactoriamente", _id: softCustomer._id, token, name: firstname, url: picture });
            return;
        });
    }
}));
router.post("/registerLoginGoogle", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let password = sha1_1.default(req.body.password);
    let picture = req.body.picture;
    let googleid = req.body.googleid;
    const softCustomeremail = yield CustomerSchema_1.default.findOne({ 'googledata.email': email });
    const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
    const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: email }, privatekey, { algorithm: "RS256" });
    if (!empty(softCustomeremail)) {
        res.status(200).json({ message: "Usuario Guardado satisfactoriamente", _id: softCustomeremail._id, token, name: firstname, url: picture });
        return;
    }
    else {
        const softCustomer = new CustomerSchema_1.default({
            xpressdata: { avaible: false },
            facebookdata: { avaible: false },
            googledata: {
                avaible: true,
                firstname,
                lastname,
                password,
                email,
                picture,
                googleid,
                profilePhoto: '',
                realpathPhoto: '',
                phone: '',
                country: '',
                state: ''
            },
            seller: false,
            points: 0,
            date: new Date(),
            history: []
        });
        softCustomer.save((err, docs) => {
            if (err) {
                res.status(300).json({ message: "Existe un problema con la base de datos", err });
                return;
            }
            res.status(200).json({ message: "Usuario Guardado satisfactoriamente", _id: softCustomer._id, token, name: firstname, url: picture });
            return;
        });
    }
}));
router.post("/registerLoginFacebookAndroid", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let password = sha1_1.default(req.body.password);
    let picture = req.body.picture;
    let facebookid = req.body.facebookid;
    let tokenfirebase = req.body.tokenfirebase;
    const softCustomerid = yield CustomerSchema_1.default.findOne({ 'facebookdata.facebookid': facebookid });
    const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
    const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: facebookid }, privatekey, { algorithm: "RS256" });
    if (!empty(softCustomerid)) {
        softCustomerid.facebookdata.picture = picture;
        softCustomerid.tokenFirebase.push(tokenfirebase);
        CustomerSchema_1.default.findByIdAndUpdate(softCustomerid._id, softCustomerid, () => {
            res.status(200).json({ message: "Bienvenido", _id: softCustomerid._id, token, name: firstname, url: picture });
            return;
        });
    }
    else {
        const softCustomer = new CustomerSchema_1.default({
            xpressdata: { avaible: false },
            facebookdata: {
                avaible: true,
                firstname,
                lastname,
                password,
                email,
                picture,
                facebookid,
                profilePhoto: '',
                realpathPhoto: '',
                phone: '',
                country: '',
                state: ''
            },
            googledata: { avaible: false },
            seller: false,
            points: 0,
            tokenFirebase: [tokenfirebase],
            date: new Date(),
            history: []
        });
        softCustomer.save((err, docs) => {
            if (err) {
                res.status(300).json({ message: "Existe un problema con la base de datos", err });
                return;
            }
            res.status(200).json({ message: "Bienvenido", _id: softCustomer._id, token, name: firstname, url: picture });
            return;
        });
    }
}));
router.post("/registerLoginFacebook", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let password = sha1_1.default(req.body.password);
    let picture = req.body.picture;
    let facebookid = req.body.facebookid;
    const softCustomerid = yield CustomerSchema_1.default.findOne({ 'facebookdata.facebookid': facebookid });
    const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
    const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: facebookid }, privatekey, { algorithm: "RS256" });
    if (!empty(softCustomerid)) {
        softCustomerid.facebookdata.picture = picture;
        CustomerSchema_1.default.findByIdAndUpdate(softCustomerid._id, softCustomerid, () => {
            res.status(200).json({ message: "Bienvenido", _id: softCustomerid._id, token, name: firstname, url: picture });
            return;
        });
    }
    else {
        const softCustomer = new CustomerSchema_1.default({
            xpressdata: { avaible: false },
            facebookdata: {
                avaible: true,
                firstname,
                lastname,
                password,
                email,
                picture,
                facebookid,
                profilePhoto: '',
                realpathPhoto: '',
                phone: '',
                country: '',
                state: ''
            },
            googledata: { avaible: false },
            seller: false,
            points: 0,
            date: new Date(),
            history: []
        });
        softCustomer.save((err, docs) => {
            if (err) {
                res.status(300).json({ message: "Existe un problema con la base de datos", err });
                return;
            }
            res.status(200).json({ message: "Bienvenido", _id: softCustomer._id, token, name: firstname, url: picture });
            return;
        });
    }
}));
router.get('/profileDataEdit/:id', (req, res) => {
    let userid = req.params.id;
    CustomerSchema_1.default.findOne({ _id: userid }).select('googledata facebookdata xpressdata').exec((err, doc) => {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
        else {
            let objectResponse;
            if (doc.googledata.avaible) {
                objectResponse = {
                    nameinput: false,
                    lastnameinput: false,
                    emailinput: false,
                    phoneinput: true,
                    phone: doc.googledata.phone,
                    pass: false,
                };
            }
            else if (doc.facebookdata.avaible) {
                objectResponse = {
                    nameinput: false,
                    lastnameinput: false,
                    emailinput: true,
                    email: (empty(doc.facebookdata.email) ? '' : doc.facebookdata.email),
                    phoneinput: true,
                    phone: doc.facebookdata.phone,
                    pass: false,
                };
            }
            else if (doc.xpressdata.avaible) {
                objectResponse = {
                    nameinput: true,
                    firstname: doc.xpressdata.firstname,
                    lastnameinput: true,
                    lastname: doc.xpressdata.lastname,
                    emailinput: true,
                    email: doc.xpressdata.email,
                    phoneinput: true,
                    phone: doc.xpressdata.phone,
                    pass: true,
                };
            }
            res.status(200).json(objectResponse);
        }
    });
});
router.post('/profileDataEdit', (req, res) => {
    let userid = req.body.userid;
    CustomerSchema_1.default.findOne({ _id: userid }).select('googledata facebookdata xpressdata').exec((err, doc) => {
        if (empty(doc)) {
            res.status(http_status_codes_1.BAD_REQUEST).json({ message: err });
        }
        else {
            if (doc.googledata.avaible) {
                doc.googledata.phone = req.body.phone;
            }
            else if (doc.facebookdata.avaible) {
                doc.facebookdata.email = req.body.email;
                doc.facebookdata.phone = req.body.phone;
            }
            else if (doc.xpressdata.avaible) {
                if (doc.xpressdata.password == sha1_1.default(req.body.password)) {
                    doc.xpressdata.firstname = req.body.firstname;
                    doc.xpressdata.lastname = req.body.lastname;
                    doc.xpressdata.email = req.body.email;
                    doc.xpressdata.phone = req.body.phone;
                    doc.xpressdata.password = req.body.password2;
                }
                else {
                    res.status(http_status_codes_1.BAD_REQUEST).json({ message: 'Su contraseña no es correcta' });
                    return;
                }
            }
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ message: 'Se actualizaron los datos' });
            });
        }
    });
});
exports.default = router;
