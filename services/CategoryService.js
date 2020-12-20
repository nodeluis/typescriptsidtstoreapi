"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const CategorySchema_1 = tslib_1.__importDefault(require("../database/CategorySchema"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const mongoose_1 = require("mongoose");
const router = express_1.Router();
router.post("/category", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "No se esta mandando ningun archivo" });
        return;
    }
    var params = req.query;
    if (req.files.icons == null) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorMessage: "Es necesario el archivo adjuntado al parámetro icons" });
        return;
    }
    var iconfile = req.files.icons;
    var date = new Date();
    var token = sha1_1.default(date.toString()).substr(0, 7);
    var iconame = token + "_" + iconfile.name.replace(/\s/g, "_");
    iconfile.mv(__dirname + "/../icons/" + iconame, function (err) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var createObjectCategory = {
                name: req.body.name,
                icons: "",
                realpath: __dirname.replace(/services/g, "") + "icons/" + iconame,
            };
            const newobjectCategory = new CategorySchema_1.default(createObjectCategory);
            newobjectCategory.icons = "/api/v1/category/get/" + newobjectCategory.id;
            const result = yield newobjectCategory.save();
            res.status(http_status_codes_1.CREATED).json({ serverMessage: "Datos almacenados con éxito", result: result });
        });
    });
});
router.get("/get", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const list = yield CategorySchema_1.default.find().select("name icons");
    res.status(http_status_codes_1.OK).json(list);
}));
router.get("/get/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    var ObjectId = mongoose_1.Types.ObjectId;
    try {
        const categoryId = new ObjectId(id);
    }
    catch (err) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorServer: "El id no es correcto" });
        return;
    }
    const result = yield CategorySchema_1.default.findOne({ _id: id });
    if (result != null) {
        res.sendFile(result.realpath);
        return;
    }
    res.status(http_status_codes_1.BAD_REQUEST).json({ errorServer: "La categoria no existe" });
}));
router.delete("/delete/:id", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    var ObjectId = mongoose_1.Types.ObjectId;
    try {
        const categoryId = new ObjectId(id);
    }
    catch (err) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ errorServer: "El id no es correcto" });
        return;
    }
    const result = yield CategorySchema_1.default.remove({ _id: id });
    res.status(http_status_codes_1.OK).json({ serverMessage: "Categoria borrada con éxito", result });
}));
exports.default = router;
