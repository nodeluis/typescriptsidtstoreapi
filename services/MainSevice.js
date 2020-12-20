"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const ProductsSchema_1 = tslib_1.__importDefault(require("../database/ProductsSchema"));
const router = express_1.Router();
router.get("/", function (req, res, next) {
    res.status(200).json({ msn: "API STORE V 1.0" });
});
router.get("/getmainlist", (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var params = req.query;
    var skip = 0;
    if (params.skip) {
        skip = Number(params.skip);
    }
    var limit = 10;
    if (params.limit) {
        limit = Number(params.limit);
    }
    const result = yield ProductsSchema_1.default.find({}).skip(skip).limit(limit);
    res.status(http_status_codes_1.OK).json(result);
}));
exports.default = router;
