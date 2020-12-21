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
        res.status(300).json({ errorMessage: "Es necesario el Email" });
        return;
    }
    if (params.password == null) {
        res.status(300).json({ errorMessage: "Es necesario el password" });
        return;
    }
    var signparams = { email: params.email, password: sha1_1.default(params.password) };
    let userLoginCorrect = yield CustomerSchema_1.default.findOne(signparams);
    if (!empty(userLoginCorrect)) {
        const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
        const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: params.email }, privatekey, { algorithm: "RS256" });
        res.status(200).json({ serverMessage: "Credenciales correctas", userdata: userLoginCorrect, token: token });
        let tokenfirebase = params.tokenfirebase;
        let indextoken = userLoginCorrect.tokenFirebase.findIndex((token) => { return token == tokenfirebase; });
        if (indextoken == -1) {
            userLoginCorrect.tokenFirebase.push(tokenfirebase);
            yield CustomerSchema_1.default.findByIdAndUpdate(userLoginCorrect._id, userLoginCorrect);
        }
        return;
    }
    res.status(200).json({ errorMessage: "Credenciales erroneas" });
}));
router.post("/tokenstore/get", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.body;
    if (params.email == null) {
        res.status(300).json({ errorMessage: "Es necesario el Email" });
        return;
    }
    if (params.password == null) {
        res.status(300).json({ errorMessage: "Es necesario el password" });
        return;
    }
    var signparams = { email: params.email, password: sha1_1.default(params.password) };
    let userLoginCorrect = yield CustomerSchema_1.default.findOne(signparams);
    if (!empty(userLoginCorrect)) {
        const privatekey = fs_1.default.readFileSync(__dirname + "/../keyrsa/jwtRS256.key", "utf8");
        const token = jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), email: params.email }, privatekey, { algorithm: "RS256" });
        res.status(200).json({ serverMessage: "Credenciales correctas", userdata: userLoginCorrect, token: token });
        return;
    }
    res.status(200).json({ errorMessage: "Credenciales erroneas" });
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
router.put("/update/profileavatar", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({ errorMessage: 'No existen archivos para subir' });
        return;
    }
    var params = req.query;
    if (params.id == null) {
        res.status(300).json({ errorMessage: "El identificador Es necesario" });
        return;
    }
    if (req.files.avatarfile == null) {
        res.status(400).send('El nombre del archivo debe llamarse "avatarfile"');
        return;
    }
    var avatarfile = req.files.avatarfile;
    var date = new Date();
    var token = sha1_1.default(date.toString()).substr(0, 7);
    var nameAvatar = token + "_" + avatarfile.name.replace(/\s/g, "_");
    avatarfile.mv(__dirname + "/../avatarfiles/" + nameAvatar, function (err) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (err) {
                res.status(400).json({ serverMessage: "Error no se pudo copiar la imagen al servidor" });
                return;
            }
            var path = '/api/v1/customer/get/avatar/' + params.id;
            var updateobj = { profilePhoto: path, realpathPhoto: __dirname.replace(/services/g, "") + "avatarfiles/" + nameAvatar };
            var result = yield CustomerSchema_1.default.update({ _id: params.id }, updateobj);
            res.status(200).json({ serverMessage: "Correcto", url: path, result });
        });
    });
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
    CustomerSchema_1.default.findOne({ email: email }).select('codePassForgot').exec((err, doc) => {
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
    CustomerSchema_1.default.findOne({ email: email }).select('codePassForgot').exec((err, doc) => {
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
    CustomerSchema_1.default.findOne({ email: email }).select('password').exec((err, doc) => {
        if (!empty(doc)) {
            doc.password = sha1_1.default(pass);
            CustomerSchema_1.default.findByIdAndUpdate(doc._id, doc, () => {
                res.status(200).json({ redir: true, message: '!!Se ha cambiado su contraseña!!' });
            });
        }
        else {
            res.status(http_status_codes_1.BAD_REQUEST).json({ redir: false, message: 'Error en la petición' });
        }
    });
});
exports.default = router;
