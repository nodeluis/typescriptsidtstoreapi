"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Connect_1 = tslib_1.__importDefault(require("./Connect"));
const CategorySchema = new Connect_1.default.Schema({
    name: String,
    icons: String,
    realpath: String,
});
const modelCategorySchema = Connect_1.default.model("category", CategorySchema);
exports.default = modelCategorySchema;
