"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Connect_1 = tslib_1.__importDefault(require("./Connect"));
const StoreSchema = Connect_1.default.Schema;
const storeSchema = new StoreSchema({
    storename: String,
    nit: String,
    city: String,
    direction: String,
    rubro: String,
    hour: String,
    phone: String,
    date: Date,
    banner: String,
    description: String,
    idcustomer: String,
    realpathphoto: String,
    verify: Boolean,
    stars: [
        {
            iduser: Connect_1.default.Types.ObjectId,
            username: String,
            star: Number,
        }
    ],
    rating: Number,
    products: [
        {
            productname: String,
            description: String,
            price: Number,
            date: Date,
            defaultimage: String,
            pathDefaultimage: String,
            discount: Number,
            likes: Number,
            quantityavailable: Number,
            pricesend: Number,
            state: Boolean,
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
            chat: [{
                    clientid: Connect_1.default.Types.ObjectId,
                    messages: [{
                            idtype: String,
                            name: String,
                            message: String,
                        }]
                }]
        }
    ],
    sales: [{
            date: Date,
            total: Number,
            product: Connect_1.default.Types.ObjectId,
        }],
    verificationstore: {
        avaible: Boolean,
        datacard: {
            directionpath: String,
            card: String,
            textcard: String
        }
    }
});
const modelStoreSchema = Connect_1.default.model("store", storeSchema);
exports.default = modelStoreSchema;
