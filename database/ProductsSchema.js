"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Connect_1 = tslib_1.__importDefault(require("./Connect"));
const ProductSchema = new Connect_1.default.Schema({
    storeId: Connect_1.default.Types.ObjectId,
    productname: String,
    description: String,
    smalldescription: String,
    ofert: {
        avaible: Boolean,
        quatity: Number,
    },
    defaultimage: String,
    pathDefaultimage: String,
    price: Number,
    date: Date,
    discount: Number,
    likes: Number,
    quantityavailable: Number,
    pricesend: Number,
    state: Boolean,
    sales: [],
    category: [
        {
            name: String,
            icons: String,
            realpath: String,
        }
    ],
    gallery: [
        {
            realpath: String,
            relativepath: String,
            description: String,
            date: Date
        }
    ],
    comments: [
        {
            commenttext: String,
            date: Date,
            gallery: [
                {
                    realpath: String,
                    relativepath: String,
                    description: String,
                    date: Date
                }
            ]
        }
    ],
});
const modelStoreSchema = Connect_1.default.model("product", ProductSchema);
exports.default = modelStoreSchema;
