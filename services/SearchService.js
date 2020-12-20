"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const ProductsSchema_1 = tslib_1.__importDefault(require("../database/ProductsSchema"));
const router = express_1.Router();
router.post("/", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.body;
    if (params.criterio == null) {
        res
            .status(http_status_codes_1.BAD_REQUEST)
            .json({ msn: "Error: es necesario un criterio de busqueda" });
        return;
    }
    try {
        var json = JSON.parse(params.criterio);
    }
    catch (err) {
        res
            .status(http_status_codes_1.BAD_REQUEST)
            .json({ msn: "EL criterio debe estar en formatio JSON {'key': 'text'}" });
        return;
    }
    var limit = 10;
    if (params.limit) {
        limit = params.limit;
    }
    var keys = Object.keys(json);
    if (keys.length > 1) {
        res.status(http_status_codes_1.BAD_REQUEST).json({ msn: "solo se admite un criterio a la vez" });
        return;
    }
    if (keys.length == 1) {
        json[keys] = new RegExp(json[keys], "i");
    }
    const result = yield ProductsSchema_1.default.find(json);
    res.status(http_status_codes_1.OK).json(result);
}));
router.post('/searchcoincidences', (req, res) => {
    let search = req.body.search;
});
exports.default = router;
