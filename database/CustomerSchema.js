"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Connect_1 = tslib_1.__importDefault(require("./Connect"));
const CustomerSchema = Connect_1.default.Schema;
const customerSchema = new CustomerSchema({
    xpressdata: {
        avaible: Boolean,
        firstname: String,
        lastname: String,
        password: String,
        email: {
            type: String,
            validate: {
                validator: (value) => {
                    return /^[\w\.]+@[\w\.]+\.\w{3,3}$/.test(value);
                    ;
                },
                message: (props) => `${props.value}, no es un email válido`
            }
        },
        profilePhoto: String,
        realpathPhoto: String,
        phone: String,
        country: String,
        state: String,
    },
    facebookdata: {
        avaible: Boolean,
        firstname: String,
        lastname: String,
        password: String,
        email: String,
        picture: String,
        facebookid: String,
        profilePhoto: String,
        realpathPhoto: String,
        phone: String,
        country: String,
        state: String,
    },
    googledata: {
        avaible: Boolean,
        firstname: String,
        lastname: String,
        password: String,
        email: String,
        picture: String,
        googleid: String,
        profilePhoto: String,
        realpathPhoto: String,
        phone: String,
        country: String,
        state: String,
    },
    tokenFirebase: [],
    date: Date,
    points: Number,
    seller: Boolean,
    codePassForgot: Number,
    roles: [
        {
            namerol: String,
            icon: String,
            date: Date,
            endpointuri: String,
            method: String,
        }
    ],
    forgot_account: [
        {
            codegen: String,
            state: Boolean,
            date: Date
        }
    ],
    sessionConnections: [
        {
            date: Date,
        }
    ],
    shoppingcart: [
        {
            date: Date,
            total: Number,
            product: Connect_1.default.Types.ObjectId,
            store: Connect_1.default.Types.ObjectId,
            cash: Boolean,
            card: Boolean,
            tokencard: String
        }
    ],
    sendAddress: [{
            state: Boolean,
            departament: String,
            city: String,
            street: String,
            nro: Number,
            reference: String,
            codeplus: String
        }],
    idstore: [{
            type: String,
            default: ""
        }
    ],
    notify: [{
            typenotification: Number,
            date: Date,
            productid: String,
            storeid: String,
            chatid: String,
            name: String,
            message: String,
            count: Number,
            userid: String,
            cash: Boolean,
            card: Boolean,
            send: Boolean,
            direction: String,
            title: String,
            description: String
        }],
    history: [{
            date: Date,
            total: Number,
            product: Connect_1.default.Types.ObjectId,
            store: Connect_1.default.Types.ObjectId,
            cash: Boolean,
            card: Boolean,
        }],
    verificationUser: {
        dataIdentificationCard: {
            avaible: Boolean,
            photo: String,
            getPhoto: String,
            textCard: {
                textIdentification: String
            }
        },
        dataProfile: {
            avaible: Boolean,
            selfie: String,
            getSelfie: String
        },
        fingerPrint: {
            avaible: Boolean,
            code: String
        },
        codeDigit: {
            avaible: Boolean,
            code: Number
        }
    },
    likestore: [{
            storeid: Connect_1.default.Types.ObjectId,
        }]
});
const CustomerModel = Connect_1.default.model("customer", customerSchema);
exports.default = CustomerModel;
