"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Connect_1 = tslib_1.__importDefault(require("./Connect"));
const GallerySchema = new Connect_1.default.Schema({
    realpath: String,
    relativepath: String,
    description: String,
    date: Date
});
const modelStoreSchema = Connect_1.default.model("gallery", GallerySchema);
exports.default = modelStoreSchema;
