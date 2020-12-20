"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const router = express_1.Router();
router.get('/test', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ msn: "Test data" });
}));
exports.default = router;
